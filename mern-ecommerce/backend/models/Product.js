const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 20000 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  imageUrl: { type: String, required: true }, gallery: { type: [String], default: [] },
  buyLink: { type: String, required: true }, category: { type: String, default: 'general', trim: true, maxlength: 80 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  stock: { type: Number, min: 0, default: null },
  colors: { type: [String], default: [] }, sizes: { type: [String], default: [] },
  clickCount: { type: Number, default: 0 },
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text' });
module.exports = mongoose.model('Product', productSchema);
