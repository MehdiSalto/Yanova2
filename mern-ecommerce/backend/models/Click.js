const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['visit', 'product_click', 'offer_click'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId },
    device: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' },
    path: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Click', clickSchema);
