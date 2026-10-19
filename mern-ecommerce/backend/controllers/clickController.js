const Click = require('../models/Click');
const { notifyAdmins } = require('../utils/events');
const registerVisit = async (req, res) => {
  if (req.admin) return res.status(204).end();
  try { await Click.create({ type: 'visit', device: req.body.device, path: req.body.path, sessionId: req.body.sessionId, eventId: req.body.eventId }); }
  catch (error) { if (error.code === 11000) return res.json({ duplicate: true }); throw error; }
  notifyAdmins(req, 'analytics:update', { type: 'visit' }); res.status(201).json({ message: 'Page view recorded.' });
};
module.exports = { registerVisit };
