import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = ['uploads', 'uploads/cvs', 'uploads/profiles'];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    if (file.fieldname === 'cv') {
      uploadPath += 'cvs/';
    } else if (file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.fieldname === 'cv') {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new ApiError('Only PDF and Word documents are allowed for CVs', 400));
    }
  } else if (file.fieldname === 'profileImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(
        new ApiError('Only image files are allowed for profile pictures', 400)
      );
    }
  } else {
    cb(null, true);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware instances (raw)
const rawUploadCV = upload.single('cv');
const rawUploadProfileImage = upload.single('profileImage');

// Error handling wrapper
const handleUploadErrors = (uploadMiddleware: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError('File too large. Maximum size is 5MB', 400));
        }
        return next(new ApiError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }

      next();
    });
  };
};

export const uploadMiddleware = {
  uploadCV: handleUploadErrors(rawUploadCV),
  uploadProfileImage: handleUploadErrors(rawUploadProfileImage),
};
