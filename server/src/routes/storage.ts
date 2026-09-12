import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';

const router = Router();
const uploadsDir = path.resolve(process.cwd(), 'uploads');

fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /storage/upload — accept multipart/form-data, save to server/uploads/
router.post('/storage/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const ext = path.extname(req.file.originalname);
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const newPath = path.join(uploadsDir, filename);
  const oldPath = req.file.path;

  try {
    await fs.rename(oldPath, newPath);
    return res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Upload error:', err);
    // Clean up temp file if rename failed
    fs.unlink(oldPath).catch(() => {});
    return res.status(500).json({ error: 'Failed to save file' });
  }
});

export default router;
