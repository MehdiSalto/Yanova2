const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Banner = require('../models/Banner');
const Click = require('../models/Click');

const getStats = async (req, res) => {
  const [totalProducts, draftProducts, activeOffers, activeBanners, totalVisits, totalClicks, topProducts, deviceStats] =
    await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'draft' }),
      Offer.countDocuments({ status: 'published' }),
      Banner.countDocuments({ active: true }),
      Click.countDocuments({ type: 'visit' }),
      Click.countDocuments({ type: 'product_click' }),
      Product.find().sort({ clickCount: -1 }).limit(5),
      Click.aggregate([{ $group: { _id: '$device', count: { $sum: 1 } } }]),
    ]);

  const clickRate = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : 0;

  res.json({
    totalProducts,
    draftProducts,
    activeOffers,
    activeBanners,
    totalVisits,
    totalClicks,
    clickRate,
    topProducts,
    deviceStats,
  });
};

module.exports = { getStats };
