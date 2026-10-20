const Offer = require('../models/Offer');
const Click = require('../models/Click');
const { list, search, pick } = require('../utils/pagination');
const httpError = require('../utils/httpError');
const publicFilter = require('../utils/offerFilter');
const { notifyAdmins } = require('../utils/events');
const { shouldTrack, trackingFields } = require('../utils/analytics');
const fields = ['title','description','imageUrl','discountPercentage','offerLink','ctaText','code','startsAt','expiresAt','status'];
const getOffers = async (req, res) => {
  const filter = req.management ? {} : publicFilter(); const term = search(req.query.search);
  const minimum = Number(req.query.minDiscount);
  if (Number.isFinite(minimum) && minimum >= 0 && minimum <= 100) filter.discountPercentage = { $gte: minimum };
  if (term) filter.$or = [{ title: term }, { description: term }];
  if (req.management && ['draft','published'].includes(req.query.status)) filter.status = req.query.status;
  res.json(await list(Offer, filter, req.query));
};
const createOffer = async (req, res) => { const offer = await Offer.create(pick(req.body, fields)); notifyAdmins(req, 'analytics:update', { type: 'offers' }); res.status(201).json(offer); };
const updateOffer = async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, { $set: pick(req.body, fields) }, { new: true, runValidators: true });
  if (!offer) throw httpError(404, 'Offer not found.'); notifyAdmins(req, 'analytics:update', { type: 'offers' }); res.json(offer);
};
const deleteOffer = async (req, res) => { if (!await Offer.findByIdAndDelete(req.params.id)) throw httpError(404, 'Offer not found.'); notifyAdmins(req, 'analytics:update', { type: 'offers' }); res.json({ message: 'Offer deleted.' }); };
const registerClick = async (req, res) => {
  if (!shouldTrack(req)) return res.status(204).end();
  const offer = await Offer.findOne({ _id: req.params.id, ...publicFilter() });
  if (!offer) throw httpError(404, 'Offer not found.');
  try { await Click.create({ type: 'offer_click', refId: offer._id, ...trackingFields(req) }); }
  catch (error) { if (error.code === 11000) return res.json({ duplicate: true }); throw error; }
  notifyAdmins(req, 'analytics:update', { type: 'offer_click' }); res.status(201).json({ message: 'Click recorded.' });
};
module.exports = { getOffers, createOffer, updateOffer, deleteOffer, registerClick };
