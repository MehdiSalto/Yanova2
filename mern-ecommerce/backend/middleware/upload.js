const multer = require('multer');
const httpError = require('../utils/httpError');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10, parts: 12 },
  fileFilter: (req, file, done) => {
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype)) return done(httpError(400, 'Choose a JPEG, PNG, WebP or GIF image.'));
    done(null, true);
  },
});
module.exports = upload;
