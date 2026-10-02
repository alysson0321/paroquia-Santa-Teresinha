const multer = require('multer');
const env = require('../config/env');

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes },
  fileFilter: (req, file, cb) => cb(null, allowed.has(file.mimetype)),
});
