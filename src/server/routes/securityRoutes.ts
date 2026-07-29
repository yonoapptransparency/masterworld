import express from 'express';
import crypto from 'crypto';
import { getIp, ensureSession, nonceStore, generateToken, verifyToken } from '../security';
import { ENCRYPTED_LINKS } from '../../lib/secureVault';
import { safeDecrypt, getAesSecret } from '../crypto';
import { getFirebaseAdminDb, getRawFirebaseConfig, parseFirestoreFields } from '../firebase';

export const securityRouter = express.Router();

/**
 * @route   GET /api/v1/_chal
 * @desc    Security Challenge Initiation
 */
securityRouter.get('/api/v1/_chal', (req, res) => {
  const ip = getIp(req);
  const sid = ensureSession(req, res);
  const nonce = crypto.randomBytes(16).toString('hex');
  const difficulty = "0000"; // Fixed difficulty for now
  
  nonceStore.set(nonce, { 
    sessionId: sid, 
    expiresAt: Date.now() + 120000, 
    issuedAt: Date.now(),
    difficulty 
  } as any);
  
  res.json({ nonce, difficulty, sid });
});

/**
 * @route   POST /api/v1/_proc
 * @desc    Security Challenge Processing & Token Issuance
 */
securityRouter.post('/api/v1/_proc', async (req, res) => {
  const { nonce, solution, fingerprint, appId, sid: clientSid } = req.body;
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"] || clientSid;

  if (!nonce || solution === undefined || !fingerprint || !appId || !sid) {
    return res.status(400).json({ error: 'Incomplete security context' });
  }

  const challenge = nonceStore.get(nonce);
  if (!challenge || challenge.sessionId !== sid) {
    return res.status(403).json({ error: 'Challenge expired or invalid' });
  }

  // PoW verification
  const check = crypto.createHash('sha256').update(nonce + solution).digest('hex');
  const difficulty = (challenge as any).difficulty || "0000";
  if (!check.startsWith(difficulty)) {
    return res.status(403).json({ error: 'Integrity check failed' });
  }

  const token = generateToken(ip, sid, fingerprint, appId);
  nonceStore.delete(nonce);

  res.json({ token });
});

/**
 * @route   GET /api/v1/link-check
 * @desc    Checks if an app has a configured link in the vault
 */
securityRouter.get('/api/v1/link-check', async (req, res) => {
  const appId = req.query.id as string;
  if (!appId) return res.json({ configured: false });

  try {
    const encryptedVault = ENCRYPTED_LINKS;
    if (!encryptedVault) return res.json({ configured: false });

    const AES_SECRET = process.env.AES_SECRET || '';
    const decryptedVault = safeDecrypt(encryptedVault, AES_SECRET);
    if (!decryptedVault) return res.json({ configured: false });

    const parsed = JSON.parse(decryptedVault);
    let hasLink = false;

    if (Array.isArray(parsed)) {
      hasLink = parsed.some((i: any) => i.id === appId && (i.url || i.more_information_url));
    } else {
      const val = parsed[appId];
      hasLink = !!(typeof val === 'string' ? val : (val?.url || val?.more_information_url));
    }

    return res.json({ configured: hasLink });
  } catch (e) {
    return res.json({ configured: false });
  }
});

/**
 * @route   GET /api/v1/moreinfo-resolve
 * @desc    Resolves app more information URL with security verification
 * @access  Public (Token protected)
 */
securityRouter.get("/api/v1/moreinfo-resolve", async (req, res) => {
  const token = (req.query.token || req.query.t) as string;
  const appId = req.query.id as string;
  const ip = getIp(req);
  const sid = req.cookies?.["__Host-sid"];
  const fingerprint = req.query.fp as string;

  if (!token || !appId) {
    return res.status(400).send("<h1>400 Bad Request</h1><p>Missing security parameters.</p>");
  }

  // Security verification
  if (!verifyToken(token, ip, sid || "", fingerprint || "", appId)) {
    console.warn(`[SECURITY] Invalid moreinfo-resolve token for appId: ${appId} from IP: ${ip}`);
    return res.status(403).send("<h1>403 Forbidden</h1><p>Security signature mismatch. Please return to the app page and try again.</p>");
  }

  try {
    let targetUrl = '';
    
    // Attempt to get from vault
    const encryptedVault = ENCRYPTED_LINKS;
    if (encryptedVault) {
      const AES_SECRET = process.env.AES_SECRET || '';
      const decryptedVault = safeDecrypt(encryptedVault, AES_SECRET);
      if (decryptedVault) {
        const parsed = JSON.parse(decryptedVault);
        let encryptedUrl = '';
        if (Array.isArray(parsed)) {
          const item = parsed.find((i: any) => i.id === appId);
          encryptedUrl = item?.url || item?.more_information_url || '';
        } else {
          const val = parsed[appId];
          encryptedUrl = typeof val === 'string' ? val : (val?.url || val?.more_information_url || '');
        }
        
        if (encryptedUrl) {
          targetUrl = encryptedUrl.startsWith('U2FsdGVkX1') ? safeDecrypt(encryptedUrl, AES_SECRET) : encryptedUrl;
        }
      }
    }

    if (targetUrl && targetUrl.startsWith('http')) {
      return res.redirect(302, targetUrl);
    }
    
    // Attempt Fallback: Check Firestore Directly
    try {
      const db = getFirebaseAdminDb();
      if (db) {
        const doc = await db.collection('app_secure_links').doc(appId).get();
        if (doc.exists) {
          const data = doc.data();
          const AES_SECRET = getAesSecret();
          const decrypted = safeDecrypt(data?.encrypted_link, AES_SECRET);
          if (decrypted && decrypted.startsWith('http')) {
             return res.redirect(302, decrypted);
          }
        }
      } else {
        // REST API Fallback for environments without Service Account
        const config = getRawFirebaseConfig();
        if (config && config.projectId) {
          const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : '';
          const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/app_secure_links/${appId}${apiSuffix}`;
          const fsRes = await fetch(url);
          if (fsRes.ok) {
            const fsDoc = await fsRes.json();
            const fields = parseFirestoreFields(fsDoc.fields);
            if (fields.encrypted_link) {
              const AES_SECRET = getAesSecret();
              const decrypted = safeDecrypt(fields.encrypted_link, AES_SECRET);
              if (decrypted && decrypted.startsWith('http')) {
                return res.redirect(302, decrypted);
              }
            }
          }
        }
      }
    } catch (fsFallbackErr) {
      console.error("[SECURITY] Firestore link resolution fallback failed:", fsFallbackErr);
    }

    return res.status(404).send("<h1>404 Not Found</h1><p>The requested application link could not be resolved. Please contact support if this error persists.</p>");
  } catch (error) {
    console.error("Resolution error:", error);
    return res.status(500).send("<h1>500 Internal Server Error</h1>");
  }
});
