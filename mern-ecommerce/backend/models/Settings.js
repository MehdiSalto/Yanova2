const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', select: false },
    aboutUs: {
      companyStory: { type: String, default: '' },
      mission: { type: String, default: '' },
      vision: { type: String, default: '' },
      contactInfo: { type: String, default: '' },
    },
    policies: {
      privacyPolicy: { type: String, default: '' },
      refundPolicy: { type: String, default: '' },
      shippingPolicy: { type: String, default: '' },
      termsConditions: { type: String, default: '' },
    },
    siteInfo: {
      siteName: { type: String, default: 'YANOBEN' },
      tagline: { type: String, default: 'Smart Technology. Better Living.' },
      supportEmail: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

settingsSchema.index({ key: 1 }, { unique: true, partialFilterExpression: { key: { $type: 'string' } } });

module.exports = mongoose.model('Settings', settingsSchema);
