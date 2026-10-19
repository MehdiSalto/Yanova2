const mongoose = require('mongoose');
const clickSchema = new mongoose.Schema({
  type: { type: String, enum: ['visit', 'product_click', 'offer_click'], required: true, index: true },
  refId: { type: mongoose.Schema.Types.ObjectId },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'], required: true },
  path: { type: String, maxlength: 1024 }, sessionId: { type: String, maxlength: 80 },
  eventId: { type: String, maxlength: 140 },
}, { timestamps: true });
clickSchema.index({ eventId: 1 }, { unique: true, sparse: true });
module.exports = mongoose.model('Click', clickSchema);
