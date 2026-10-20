const VisitorSession = require('../models/VisitorSession');
const ACTIVE_WINDOW_MS = 2 * 60 * 1000;
const shouldTrack = req => !req.admin && !/bot|crawler|spider|headless|preview|lighthouse/i.test(req.get('user-agent') || '');
const trackingFields = req => {
  // Pages overwrites this header using request.cf.country, never browser input.
  const code = String(req.get('x-yanoben-country') || '').toUpperCase();
  return {
    device: req.body.device, sessionId: req.body.sessionId,
    visitorId: req.body.visitorId || req.body.sessionId, eventId: req.body.eventId,
    country: /^[A-Z]{2}$/.test(code) && !['XX', 'T1'].includes(code) ? code : 'ZZ',
  };
};
const recordPresence = async req => {
  const { visitorId, sessionId, country, device } = trackingFields(req);
  const update = { $set: { sessionId, country, device, path: req.body.path || '/', lastSeen: new Date() } };
  try { await VisitorSession.findOneAndUpdate({ visitorId }, update, { upsert: true, new: true, runValidators: true }); }
  catch (error) { if (error.code !== 11000) throw error; await VisitorSession.findOneAndUpdate({ visitorId }, update); }
};
const countryRows = rows => {
  const total = rows.reduce((sum, row) => sum + row.visitors, 0);
  return rows.map(row => ({ code: row._id || 'ZZ', visitors: row.visitors, percentage: total ? Math.round(row.visitors / total * 10000) / 100 : 0 }));
};
const activeSnapshot = async () => {
  const rows = await VisitorSession.aggregate([
    { $match: { lastSeen: { $gte: new Date(Date.now() - ACTIVE_WINDOW_MS) } } },
    { $group: { _id: '$country', visitors: { $sum: 1 } } },
    { $sort: { visitors: -1, _id: 1 } },
  ]);
  return { total: rows.reduce((sum, row) => sum + row.visitors, 0), countries: countryRows(rows), windowSeconds: ACTIVE_WINDOW_MS / 1000, updatedAt: new Date().toISOString() };
};
module.exports = { shouldTrack, trackingFields, recordPresence, countryRows, activeSnapshot };
