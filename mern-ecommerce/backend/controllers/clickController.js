const Click = require('../models/Click');
const { notifyAdmins } = require('../utils/events');
const { shouldTrack, trackingFields, recordPresence } = require('../utils/analytics');
const registerVisit = async (req, res) => {
  if (!shouldTrack(req)) return res.status(204).end();
  try { await Click.create({ type: 'visit', path: req.body.path, ...trackingFields(req) }); }
  catch (error) { if (error.code === 11000) return res.json({ duplicate: true }); throw error; }
  await recordPresence(req);
  notifyAdmins(req, 'analytics:update', { type: 'visit' }); res.status(201).json({ message: 'Page view recorded.' });
};
const heartbeat = async (req, res) => {
  if (!shouldTrack(req)) return res.status(204).end();
  await recordPresence(req); res.status(204).end();
};
module.exports = { registerVisit, heartbeat };
