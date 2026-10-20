const Settings = require('../models/Settings');
const { pick } = require('../utils/pagination');
const document = async () => {
  const settings = (await Settings.findOne()) || await Settings.findOneAndUpdate({ key: 'site' }, { $setOnInsert: { key: 'site' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  // Rename saved brand copy as well as defaults; retain contact details and URLs.
  for (const path of ['siteInfo.siteName', 'siteInfo.tagline', 'aboutUs.companyStory', 'aboutUs.mission', 'aboutUs.vision', 'policies.privacyPolicy', 'policies.refundPolicy', 'policies.shippingPolicy', 'policies.termsConditions']) {
    const value = settings.get(path);
    if (typeof value === 'string' && /\byanova\b/i.test(value)) settings.set(path, value.replace(/\byanova\b/gi, 'YANOBEN'));
  }
  if (settings.isModified()) await settings.save();
  return settings;
};
const getSettings = async (req, res) => { res.json(await document()); };
const updateSection = (section, fields) => async (req, res) => {
  const settings = await document();
  for (const [key, value] of Object.entries(pick(req.body[section], fields))) settings.set(`${section}.${key}`, value);
  await settings.save(); res.json(settings);
};
const updateAbout = updateSection('aboutUs', ['companyStory','mission','vision','contactInfo']);
const updatePolicies = updateSection('policies', ['privacyPolicy','refundPolicy','shippingPolicy','termsConditions']);
const updateSite = updateSection('siteInfo', ['siteName','tagline','supportEmail']);
module.exports = { getSettings, updateAbout, updatePolicies, updateSite };
