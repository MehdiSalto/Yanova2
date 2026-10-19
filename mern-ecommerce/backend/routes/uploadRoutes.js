const express = require('express');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { uploadsPath } = require('../config/uploads');
const upload = require('../middleware/upload');
const { protect, requireRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { uploadLimiter } = require('../middleware/security');
const wrap = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const router = express.Router();
router.post('/', protect, requireRole('admin','superadmin'), uploadLimiter, csrfProtection, upload.single('image'), wrap(async (req, res) => {
  if (!req.file) throw httpError(400, 'Choose an image to upload.');
  let image;
  try {
    // Decode actual bytes, limit decompressed pixels, strip metadata, normalize
    // to a static WebP; user-controlled names never become public filenames.
    image = await sharp(req.file.buffer, { limitInputPixels: 20000000, failOn: 'error' }).rotate().webp({ quality: 88 }).toBuffer();
  } catch { throw httpError(400, 'This image is invalid or exceeds the 20 megapixel limit.'); }
  const filename = `${crypto.randomUUID()}.webp`;
  await fs.mkdir(uploadsPath(), { recursive: true });
  await fs.writeFile(path.join(uploadsPath(), filename), image, { flag: 'wx' });
  res.status(201).json({ url: `/uploads/${filename}` });
}));
module.exports = router;
