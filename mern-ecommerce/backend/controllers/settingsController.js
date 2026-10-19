const Settings = require('../models/Settings');
const { pick } = require('../utils/pagination');
const document = async () => (await Settings.findOne()) || Settings.findOneAndUpdate({ key: 'site' }, { $setOnInsert: { key: 'site' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
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
