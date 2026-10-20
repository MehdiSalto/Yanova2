const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  visitorId: { type: String, required: true, unique: true, maxlength: 80 },
  sessionId: { type: String, required: true, maxlength: 80 },
  country: { type: String, match: /^[A-Z]{2}$/, default: 'ZZ' },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'], required: true },
  path: { type: String, maxlength: 1024 },
  lastSeen: { type: Date, required: true },
});
// Presence expires independently of historical analytics events.
schema.index({ lastSeen: 1 }, { expireAfterSeconds: 86400 });
module.exports = mongoose.model('VisitorSession', schema);
