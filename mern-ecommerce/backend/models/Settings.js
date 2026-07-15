const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
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
      siteName: { type: String, default: 'YANOVA' },
      tagline: { type: String, default: 'Smart Technology. Better Living.' },
      supportEmail: { type: String, default: 'support@yanova.com' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
