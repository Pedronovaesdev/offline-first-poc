import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const anexoId = String(req.body?.anexoId ?? 'sem-id');
        const ext = path.extname(file.originalname) || '';
        cb(null, `${anexoId}${ext}`);
    },
})

export const uploadMiddleware = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  });