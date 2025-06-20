import multer from 'multer';

const storage = multer.memoryStorage(); // ✅ Store files in memory (RAM), not disk

export const upload = multer({ storage });
