const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const AppError = require('../utils/AppError');

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'kore/certificados';

function assertCloudinaryConfig() {
  const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    .filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new AppError(`Storage externo não configurado. Defina: ${missing.join(', ')}.`, 500);
  }
}

function configureCloudinary() {
  assertCloudinaryConfig();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function normalizeFolderPart(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function buildFolder(parts = []) {
  const suffix = parts.map(normalizeFolderPart).filter(Boolean).join('/');
  return suffix ? `${CLOUDINARY_FOLDER}/${suffix}` : CLOUDINARY_FOLDER;
}

function resourceTypeFor(file) {
  return file.mimetype === 'application/pdf' ? 'raw' : 'image';
}

function uploadBuffer(file, options = {}) {
  configureCloudinary();

  if (!file?.buffer) {
    throw new AppError('Arquivo invalido para upload.', 400);
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  const publicId = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const resourceType = resourceTypeFor(file);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: buildFolder(options.folderParts),
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false
      },
      (error, result) => {
        if (error) return reject(error);

        return resolve({
          url: result.secure_url,
          storageKey: result.public_id,
          resourceType: result.resource_type,
          provider: 'cloudinary',
          bytes: result.bytes || file.size,
          formato: result.format
        });
      }
    );

    stream.end(file.buffer);
  });
}

async function uploadArquivos(files = [], options = {}) {
  return Promise.all(files.map((file) => uploadBuffer(file, options)));
}

function signedDownloadUrls({ storageKey, nomeArquivo, resourceType = 'raw' }) {
  configureCloudinary();

  const extFromKey = path.extname(storageKey || '').replace('.', '').toLowerCase();
  const extFromName = path.extname(nomeArquivo || '').replace('.', '').toLowerCase();
  const format = extFromKey || extFromName || 'pdf';
  const publicIdSemExt = storageKey && extFromKey
    ? storageKey.slice(0, -(extFromKey.length + 1))
    : storageKey;

  return [
    cloudinary.utils.private_download_url(storageKey, format, {
      resource_type: resourceType || 'raw',
      type: 'upload',
      attachment: true,
      expires_at: Math.floor(Date.now() / 1000) + 300
    }),
    publicIdSemExt && publicIdSemExt !== storageKey
      ? cloudinary.utils.private_download_url(publicIdSemExt, format, {
        resource_type: resourceType || 'raw',
        type: 'upload',
        attachment: true,
        expires_at: Math.floor(Date.now() / 1000) + 300
      })
      : null
  ].filter(Boolean);
}

module.exports = {
  uploadBuffer,
  uploadArquivos,
  signedDownloadUrls
};
