import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Allow most common file types
  const allowedTypes = /jpeg|jpg|png|gif|bmp|svg|webp|mp4|avi|mov|wmv|flv|webm|mkv|m4v|mp3|wav|flac|aac|ogg|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z|tar|gz|json|xml|css|js|html|md|rtf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check common MIME types
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/webp',
    // Videos
    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/x-flv', 'video/webm', 'video/x-matroska',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Text files
    'text/plain', 'text/csv', 'application/json', 'text/xml', 'application/xml', 'text/css', 'text/javascript', 'text/html', 'text/markdown',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip',
    // Rich text
    'application/rtf'
  ];
  
  const mimetypeAllowed = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('text/') || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/');

  if (extname || mimetypeAllowed) {
    return cb(null, true);
  } else {
    cb(new Error('File type not supported. Supported types: Images, Videos, Documents, Audio, Archives, and Text files'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '1000000000') // 1GB default
  }
});
