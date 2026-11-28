import { Router } from 'express';
import crypto from 'crypto';

const uploadRouter = Router();

function getCloudinaryCredentials() {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();
  const folder = 'rummydex_uploads';

  return { cloudName, apiKey, apiSecret, folder };
}

const ALLOWED_RASTER_MIMES = new Set(['png', 'jpeg', 'jpg', 'webp', 'gif', 'avif']);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

function isPrivateIpv4(a: number, b: number): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function isSafeExternalImageUrl(rawUrl: string): boolean {
  try {
    if (rawUrl.length > 2048) return false;
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    if (parsed.username || parsed.password) return false;

    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (!host) return false;

    // Block loopback, link-local, cloud metadata, IPv6 private/mapped ranges, and local hostnames
    if (
      host === 'localhost' ||
      host === '::' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === 'metadata.google.internal' ||
      host.startsWith('::ffff:') ||
      host.startsWith('fe80:') ||
      host.startsWith('fc') ||
      host.startsWith('fd') ||
      /^\d+$/.test(host) ||
      /^0x[0-9a-f]+$/i.test(host)
    ) {
      return false;
    }

    // Block private/reserved IPv4 literals (including octal/hex octet bypasses)
    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
      const octets = [Number(ipv4[1]), Number(ipv4[2]), Number(ipv4[3]), Number(ipv4[4])];
      if (octets.some((n) => n < 0 || n > 255)) return false;
      if (isPrivateIpv4(octets[0], octets[1])) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

// Generate server-signed parameters for high-speed client-side Cloudinary upload
uploadRouter.get('/api/v1/admin/upload/signature', (_req, res) => {
  try {
    const { cloudName, apiKey, apiSecret, folder } = getCloudinaryCredentials();
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({
        status: 'ERROR',
        error: 'Cloudinary environment variables are not configured on the server.'
      });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    res.json({
      status: 'OK',
      success: true,
      cloud_name: cloudName,
      api_key: apiKey,
      timestamp,
      signature,
      folder
    });
  } catch (err: any) {
    res.status(500).json({ status: 'ERROR', error: err.message || 'Failed to generate upload signature' });
  }
});

// Direct server-side upload to Cloudinary (handles Base64 or external URLs)
uploadRouter.post('/api/v1/admin/upload', async (req, res) => {
  try {
    const { cloudName, apiKey, apiSecret, folder } = getCloudinaryCredentials();
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({
        status: 'ERROR',
        error: 'Cloudinary environment variables are not configured on the server.'
      });
    }

    const body = req.body || {};
    const imagePayload = body.image_base64 || body.file || body.image_url || body.url;

    if (!imagePayload || typeof imagePayload !== 'string') {
      return res.status(400).json({ status: 'ERROR', error: 'Missing image data payload' });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    // Build form data for Cloudinary
    let fileBlob: Blob;
    let fileName = `upload_${Date.now()}`;

    if (imagePayload.startsWith('data:image/')) {
      const match = imagePayload.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1].toLowerCase();
        if (!ALLOWED_RASTER_MIMES.has(mimeType)) {
          return res.status(400).json({ status: 'ERROR', error: 'Unsupported image format. Use PNG, JPG, WEBP, GIF, or AVIF.' });
        }
        const buffer = Buffer.from(match[2], 'base64');
        if (buffer.byteLength === 0 || buffer.byteLength > MAX_UPLOAD_BYTES) {
          return res.status(413).json({ status: 'ERROR', error: 'Image file must be non-empty and under 10 MB.' });
        }
        const normalizedMime = mimeType === 'jpg' ? 'jpeg' : mimeType;
        fileBlob = new Blob([buffer], { type: `image/${normalizedMime}` });
        fileName = `upload_${Date.now()}.${normalizedMime === 'jpeg' ? 'jpg' : normalizedMime}`;
      } else {
        return res.status(400).json({ status: 'ERROR', error: 'Invalid base64 image format' });
      }
    } else if (/^https?:\/\//i.test(imagePayload)) {
      if (!isSafeExternalImageUrl(imagePayload)) {
        return res.status(400).json({ status: 'ERROR', error: 'Invalid or disallowed image URL' });
      }
      // URL upload
      const formData = new FormData();
      formData.append('file', imagePayload);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cRes = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(15000)
      });

      const cData = await cRes.json();
      if (!cRes.ok || !cData.secure_url) {
        return res.status(cRes.status || 500).json({
          status: 'ERROR',
          error: cData.error?.message || 'Cloudinary URL upload failed'
        });
      }

      return res.json({
        status: 'OK',
        success: true,
        secure_url: cData.secure_url,
        url: cData.secure_url,
        width: cData.width,
        height: cData.height,
        format: cData.format,
        bytes: cData.bytes
      });
    } else {
      return res.status(400).json({ status: 'ERROR', error: 'Unsupported image payload format' });
    }

    const formData = new FormData();
    formData.append('file', fileBlob, fileName);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('folder', folder);

    const cRes = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(15000)
    });

    const cData = await cRes.json();
    if (!cRes.ok || !cData.secure_url) {
      return res.status(cRes.status || 500).json({
        status: 'ERROR',
        error: cData.error?.message || 'Cloudinary upload failed'
      });
    }

    return res.json({
      status: 'OK',
      success: true,
      secure_url: cData.secure_url,
      url: cData.secure_url,
      width: cData.width,
      height: cData.height,
      format: cData.format,
      bytes: cData.bytes
    });
  } catch (err: any) {
    console.error('[UploadRouter] Error processing upload:', err);
    return res.status(500).json({
      status: 'ERROR',
      error: err.message || 'Server error processing upload'
    });
  }
});

export default uploadRouter;
