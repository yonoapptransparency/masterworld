import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminToken } from '../middleware/adminAuth';
import * as dotenv from 'dotenv';

dotenv.config();

const uploadRouter = Router();

// Configure Cloudinary (falls back to process.env if available, or initialize explicitly)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

uploadRouter.get('/api/v1/admin/upload/signature', verifyAdminToken, (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY) {
    return res.status(500).json({ status: 'ERR', msg: 'Cloudinary credentials are not configured on the server.' });
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'rummydex_uploads';

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.json({ 
      status: 'OK', 
      signature, 
      timestamp, 
      folder, 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY
    });
  } catch (error: any) {
    console.error('Cloudinary signature error:', error);
    return res.status(500).json({ status: 'ERR', msg: 'Failed to generate upload signature.' });
  }
});

uploadRouter.post('/api/v1/admin/upload', verifyAdminToken, async (req, res) => {
  const { image_base64 } = req.body;
  
  if (!image_base64) {
    return res.status(400).json({ status: 'ERR', msg: 'No image data provided.' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return res.status(500).json({ status: 'ERR', msg: 'Cloudinary credentials are not configured on the server.' });
  }

  try {
    const result = await cloudinary.uploader.upload(image_base64, {
      folder: 'rummydex_uploads',
    });
    
    return res.json({ status: 'OK', secure_url: result.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ status: 'ERR', msg: error.message || 'Failed to upload image to Cloudinary.' });
  }
});

export default uploadRouter;
