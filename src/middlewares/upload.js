const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const allowedExtensions = (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png')
  .split(',')
  .map((item) => item.trim().toLowerCase());

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new AppError('Tipo de arquivo não permitido.', 400));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_BYTES || 5 * 1024 * 1024)
  }
});

module.exports = upload;
