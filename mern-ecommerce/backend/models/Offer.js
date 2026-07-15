const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    offerLink: { type: String, required: true },
    ctaText: { type: String, default: 'Shop Now' },
    expiresAt: { type: Date },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
