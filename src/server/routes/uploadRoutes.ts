import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminToken } from '../middleware/adminAuth';
import { getMasterSettings } from '../vault/vaultStorage';
import * as dotenv from 'dotenv';

dotenv.config();

export const uploadRouter = Router();

async function getResolvedServerCloudinaryConfig(authToken?: string) {
  let settings: any = {};
  try {
    settings = await getMasterSettings(authToken);
  } catch (_) {}

  const cloud_name = (
    process.env.CLOUDINARY_CLOUD_NAME ||
    settings?.cloudinary_cloud_name ||
    'diewalae4'
  ).trim();

  const api_key = (
    process.env.CLOUDINARY_API_KEY ||
    settings?.cloudinary_api_key ||
    '883757976464181'
  ).trim();

  const api_secret = (
    process.env.CLOUDINARY_API_SECRET ||
    settings?.cloudinary_api_secret ||
    ''
  ).trim();

  const upload_preset = (
    process.env.CLOUDINARY_UPLOAD_PRESET ||
    settings?.cloudinary_upload_preset ||
    'rummydex'
  ).trim();

  return { cloud_name, api_key, api_secret, upload_preset };
}

uploadRouter.get('/api/v1/admin/upload/signature', verifyAdminToken, async (req: any, res: any) => {
  try {
    const cfg = await getResolvedServerCloudinaryConfig(req.headers.authorization);

    if (!cfg.cloud_name) {
      return res.status(400).json({ status: 'ERR', msg: 'Cloudinary Cloud Name is required.' });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'rummydex_uploads';

    if (cfg.api_secret) {
      cloudinary.config({
        cloud_name: cfg.cloud_name,
        api_key: cfg.api_key,
        api_secret: cfg.api_secret
      });

      const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        cfg.api_secret
      );

      return res.json({ 
        status: 'OK', 
        signature, 
        timestamp, 
        folder, 
        cloud_name: cfg.cloud_name,
        api_key: cfg.api_key,
        upload_preset: cfg.upload_preset
      });
    } else {
      // Return config for unsigned upload
      return res.json({
        status: 'OK',
        timestamp,
        folder,
        cloud_name: cfg.cloud_name,
        api_key: cfg.api_key,
        upload_preset: cfg.upload_preset,
        signature: ''
      });
    }
  } catch (error: any) {
    console.error('Cloudinary signature error:', error);
    return res.status(500).json({ status: 'ERR', msg: 'Failed to generate upload signature: ' + (error.message || 'Unknown error') });
  }
});

uploadRouter.post('/api/v1/admin/upload', verifyAdminToken, async (req: any, res: any) => {
  const { image_base64, image } = req.body;
  const payload = image_base64 || image;
  
  if (!payload) {
    return res.status(400).json({ status: 'ERR', msg: 'No image data provided.' });
  }

  try {
    const cfg = await getResolvedServerCloudinaryConfig(req.headers.authorization);

    if (!cfg.cloud_name) {
      return res.status(400).json({ status: 'ERR', msg: 'Cloudinary Cloud Name is required.' });
    }

    if (cfg.api_secret && cfg.api_key) {
      cloudinary.config({
        cloud_name: cfg.cloud_name,
        api_key: cfg.api_key,
        api_secret: cfg.api_secret
      });

      const result = await cloudinary.uploader.upload(payload, {
        folder: 'rummydex_uploads'
      });
      
      return res.json({ status: 'OK', secure_url: result.secure_url });
    } else {
      // Direct HTTP Unsigned Upload to Cloudinary
      const formData = new URLSearchParams();
      formData.append('file', payload);
      formData.append('upload_preset', cfg.upload_preset || 'rummydex');
      formData.append('folder', 'rummydex_uploads');

      const cRes = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloud_name)}/image/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const cData = await cRes.json().catch(() => ({}));

      if (cRes.ok && cData.secure_url) {
        return res.json({ status: 'OK', secure_url: cData.secure_url });
      } else {
        const errMsg = cData.error?.message || `Cloudinary HTTP ${cRes.status}`;
        return res.status(400).json({ status: 'ERR', msg: `Upload failed: ${errMsg}` });
      }
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ status: 'ERR', msg: error.message || 'Failed to upload image to Cloudinary.' });
  }
});

export default uploadRouter;
