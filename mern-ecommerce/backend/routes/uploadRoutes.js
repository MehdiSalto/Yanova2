const express = require('express');
const { storeImage } = require('../services/imageStorage');
const MediaAsset = require('../models/MediaAsset');
const upload = require('../middleware/upload');
const { protect, requireRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { uploadLimiter } = require('../middleware/security');
const wrap = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const router = express.Router();
router.post('/', protect, requireRole('admin','superadmin'), uploadLimiter, csrfProtection, upload.single('image'), wrap(async (req, res) => {
  if (!req.file) throw httpError(400, 'Choose an image to upload.');
  const asset = await storeImage(req.file.buffer);
  if (asset.provider === 'cloudinary') await MediaAsset.create(asset);
  res.status(201).json(asset);
}));
module.exports = router;
