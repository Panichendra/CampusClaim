import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// configure the storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // destination where the uploaded file should be stored
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) { // generating unique file name to avoid duplicate/overwriting of files
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter files
const fileFilter = (req, file, cb) => { // filter to  handle filetype 
  // Accepted formats
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file is handled by the limits field
  }
});

export default upload; // now this upload middleware can be used in any of the api call handlers in express to handle file uploads
