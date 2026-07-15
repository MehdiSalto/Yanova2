const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json(settings);
};

const updateAbout = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  settings.aboutUs = { ...settings.aboutUs, ...req.body.aboutUs };
  await settings.save();
  res.json(settings);
};

const updatePolicies = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  settings.policies = { ...settings.policies, ...req.body.policies };
  await settings.save();
  res.json(settings);
};

module.exports = { getSettings, updateAbout, updatePolicies };
