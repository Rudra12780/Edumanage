const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the storage directory exists
const os = require('os');
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'edumanage-uploads', 'assignments')
  : path.join(__dirname, '..', 'uploads', 'assignments');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.warn('[EduManage Upload] Warning creating upload dir:', err.message);
  }
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize original filename and append unique timestamp
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for assignments
const fileFilter = (req, file, cb) => {
  // Allow all common assignment files (documents, code, archives, images, data files)
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  },
  fileFilter: fileFilter
});

module.exports = {
  upload,
  uploadDir
};
