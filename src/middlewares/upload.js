const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

const allowedExtensions = (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png')
  .split(',')
  .map((item) => item.trim().toLowerCase());

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png'
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).replace('.', '').toLowerCase();

  if (!allowedExtensions.includes(ext) || !allowedMimeTypes.has(file.mimetype)) {
    return cb(new AppError('Tipo de arquivo nao permitido. Envie PDF, JPG/JPEG ou PNG.', 400));
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
