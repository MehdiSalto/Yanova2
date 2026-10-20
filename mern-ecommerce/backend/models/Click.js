const mongoose = require('mongoose');
const clickSchema = new mongoose.Schema({
  type: { type: String, enum: ['visit', 'product_view', 'product_click', 'offer_click'], required: true, index: true },
  refId: { type: mongoose.Schema.Types.ObjectId },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'], required: true },
  path: { type: String, maxlength: 1024 }, sessionId: { type: String, maxlength: 80 },
  eventId: { type: String, maxlength: 140 },
  visitorId: { type: String, maxlength: 80 },
  country: { type: String, match: /^[A-Z]{2}$/, default: 'ZZ' },
}, { timestamps: true });
clickSchema.index({ eventId: 1 }, { unique: true, sparse: true });
clickSchema.index({ type: 1, createdAt: -1 });
clickSchema.index({ refId: 1, type: 1, createdAt: -1 });
module.exports = mongoose.model('Click', clickSchema);
