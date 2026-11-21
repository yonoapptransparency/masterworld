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

function isSafeExternalImageUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    if (parsed.username || parsed.password) return false;

    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (!host) return false;

    // Block loopback, link-local, cloud metadata, and local network hostnames
    if (
      host === 'localhost' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === 'metadata.google.internal' ||
      host.startsWith('fe80:') ||
      host.startsWith('fc') ||
      host.startsWith('fd')
    ) {
      return false;
    }

    // Block private/reserved IPv4 literals
    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
      const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
      if (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 100 && b >= 64 && b <= 127)
      ) {
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
      const match = imagePayload.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        fileBlob = new Blob([buffer], { type: `image/${mimeType}` });
        fileName = `upload_${Date.now()}.${mimeType === 'jpeg' ? 'jpg' : mimeType}`;
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
        body: formData
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
      body: formData
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
