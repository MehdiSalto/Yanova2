const express = require('express');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
