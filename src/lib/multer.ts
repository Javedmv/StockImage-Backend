import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'stockImage',
    allowedFormats: ['jpeg', 'png', 'jpg'],
  } as { folder: string; allowedFormats: string[] },
});

export const upload = multer({ storage });
