const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 200 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  subject: { type: String, required: true, maxlength: 300 },
  message: { type: String, required: true, maxlength: 10000 },
  isRead: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
}, { timestamps: true });
module.exports = mongoose.model('Contact', contactSchema);
