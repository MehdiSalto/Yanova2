const mongoose = require('mongoose');
const { fields, statuses } = require('../config/sponsorshipForm');
const schema = new mongoose.Schema({
  ...Object.fromEntries(fields.map(field => [field.key, { type: String, trim: true, required: !!field.required, minlength: field.minLength || 0, maxlength: field.maxLength, ...(field.key === 'email' ? { lowercase: true } : {}) }])),
  submissionId: { type: String, required: true, unique: true, match: /^[a-f0-9]{32}$/ },
  contactConsent: { type: Boolean, required: true, validate: value => value === true },
  status: { type: String, enum: statuses, default: 'new', index: true },
  internalNotes: { type: String, maxlength: 5000, default: '' },
}, { timestamps: true });
schema.index({ createdAt: -1 });
module.exports = mongoose.model('Sponsorship', schema);
