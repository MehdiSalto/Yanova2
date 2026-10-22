const Click = require('../models/Click');
const Product = require('../models/Product');
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
const registerViews = async (req, res) => {
  if (!shouldTrack(req)) return res.status(204).end();
  const ids = [...new Set(req.body.events.map(event => event.productId))];
  const published = new Set((await Product.find({ _id: { $in: ids }, status: 'published' }).select('_id').lean()).map(product => String(product._id)));
  const common = trackingFields(req);
  const events = req.body.events.filter(event => published.has(event.productId)).map(event => ({ ...common, type: 'product_view', refId: event.productId, eventId: event.eventId }));
  if (events.length) {
    try { await Click.insertMany(events, { ordered: false }); }
    catch (error) {
      // A retry can contain both old and new events. Keep the new inserts and
      // ignore only unique-event duplicates; never hide a database failure.
      const failures = error.writeErrors || [];
      if (error.code !== 11000 || failures.some(item => (item.code ?? item.err?.code) !== 11000)) throw error;
    }
    notifyAdmins(req, 'analytics:update', { type: 'product_view' });
  }
  res.status(201).json({ accepted: events.length });
};
module.exports = { registerVisit, heartbeat, registerViews };
