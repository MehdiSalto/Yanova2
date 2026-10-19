const mongoose = require('mongoose');
const offerSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 20000 },
  imageUrl: { type: String, required: true },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  offerLink: { type: String, required: true }, ctaText: { type: String, default: 'Shop Now' },
  code: { type: String, default: '', maxlength: 50 }, startsAt: { type: Date, default: null }, expiresAt: { type: Date, default: null },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
}, { timestamps: true });
module.exports = mongoose.model('Offer', offerSchema);
