const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true, unique: true },
  version: Number, width: Number, height: Number, bytes: Number, format: String,
  sourceUrl: { type: String, index: true },
}, { timestamps: true });
module.exports = mongoose.model('MediaAsset', schema);
