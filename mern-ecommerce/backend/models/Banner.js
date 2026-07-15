const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String },
    position: { type: String, enum: ['hero', 'top', 'middle', 'footer'], default: 'hero' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
