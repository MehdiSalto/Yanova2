const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Banner = require('../models/Banner');
const Click = require('../models/Click');
const Contact = require('../models/Contact');
const publicOfferFilter = require('../utils/offerFilter');
const getStats = async (req, res) => {
  const [totalProducts, draftProducts, activeOffers, activeBanners, totalVisits, totalClicks, totalOfferClicks, newContacts, topProducts, deviceStats, sessions] = await Promise.all([
    Product.countDocuments(), Product.countDocuments({ status: 'draft' }), Offer.countDocuments(publicOfferFilter()), Banner.countDocuments({ active: true }),
    Click.countDocuments({ type: 'visit' }), Click.countDocuments({ type: 'product_click' }), Click.countDocuments({ type: 'offer_click' }), Contact.countDocuments({ isRead: false }),
    Product.find().sort({ clickCount: -1 }).limit(5).lean(),
    Click.aggregate([{ $match: { type: 'visit' } }, { $group: { _id: '$device', count: { $sum: 1 } } }]),
    Click.aggregate([{ $match: { type: 'visit', sessionId: { $type: 'string' } } }, { $group: { _id: '$sessionId' } }, { $count: 'count' }]),
  ]);
  const totalOutboundClicks = totalClicks + totalOfferClicks;
  res.json({ totalProducts, draftProducts, activeOffers, activeBanners, totalVisits, totalClicks, totalOfferClicks, totalOutboundClicks, newContacts, topProducts, deviceStats,
    sessions: sessions[0]?.count || 0, clickRate: totalVisits ? Number((totalOutboundClicks / totalVisits * 100).toFixed(1)) : 0 });
};
module.exports = { getStats };
