import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminToken } from '../middleware/adminAuth';
import * as dotenv from 'dotenv';

dotenv.config();

const uploadRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configure Cloudinary (falls back to process.env if available, or initialize explicitly)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

uploadRouter.post('/api/v1/admin/upload', verifyAdminToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'ERR', msg: 'No file uploaded.' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return res.status(500).json({ status: 'ERR', msg: 'Cloudinary credentials are not configured on the server.' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'rummydex_uploads' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ status: 'ERR', msg: error.message || 'Failed to upload image to Cloudinary.' });
      }
      return res.json({ status: 'OK', secure_url: result?.secure_url });
    }
  );

  uploadStream.end(req.file.buffer);
});

export default uploadRouter;
