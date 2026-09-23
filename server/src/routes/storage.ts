import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import type { AuthedRequest } from '../middleware/auth.js';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith('image/'));
  },
});

// POST /storage/upload — accept multipart/form-data and upload to Cloudinary
router.post('/storage/upload', upload.single('file'), async (req: AuthedRequest, res: Response) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'blog-master/covers',
          resource_type: 'image',
        },
        (error, uploaded) => {
          if (error || !uploaded?.secure_url) {
            reject(error ?? new Error('Cloudinary did not return an image URL'));
            return;
          }
          resolve(uploaded as { secure_url: string });
        },
      );
      stream.end(req.file!.buffer);
    });

    return res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
