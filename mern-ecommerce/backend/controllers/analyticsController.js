const mongoose = require('mongoose');
const Product = require('../models/Product');
const Click = require('../models/Click');
const { search } = require('../utils/pagination');
const httpError = require('../utils/httpError');
const { activeSnapshot, countryRows } = require('../utils/analytics');
const visitorKey = { $ifNull: ['$visitorId', { $ifNull: ['$sessionId', { $toString: '$_id' }] }] };
const percent = (count, total) => total ? Math.round(count / total * 10000) / 100 : 0;
const getActive = async (req, res) => { res.set('Cache-Control', 'private, no-store'); res.json(await activeSnapshot()); };
const getAnalytics = async (req, res) => {
  const range = req.query.range || '30d';
  if (!['today', '7d', '30d', '90d', 'all'].includes(range)) throw httpError(400, 'Choose a valid analytics period.');
  const end = new Date(); let start = null;
  if (range !== 'all') {
    start = new Date(end); start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - ({ today: 1, '7d': 7, '30d': 30, '90d': 90 }[range] - 1));
  }
  const match = { createdAt: { ...(start ? { $gte: start } : {}), $lte: end } };
  const productId = req.query.productId;
  if (productId && !mongoose.isValidObjectId(productId)) throw httpError(400, 'Invalid product identifier.');
  const product = productId ? await Product.findById(productId).lean() : null;
  if (productId && !product) throw httpError(404, 'Product not found.');
  if (productId) { match.refId = product._id; match.type = { $in: ['product_view', 'product_click'] }; }
  const audienceMatch = { ...match, type: productId ? 'product_view' : 'visit' };
  const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1));
  const limit = 20; const filter = productId ? { _id: product._id } : {};
  const term = search(req.query.search); if (term && !productId) filter.name = term;
  const [counts, audience, daily, items, total, active] = await Promise.all([
    Click.aggregate([{ $match: match }, { $group: { _id: '$type', count: { $sum: 1 }, visitors: { $addToSet: visitorKey }, sessions: { $addToSet: '$sessionId' } } }]),
    Click.aggregate([{ $match: audienceMatch }, { $sort: { createdAt: -1, _id: -1 } }, { $group: { _id: visitorKey, country: { $first: { $ifNull: ['$country', 'ZZ'] } }, device: { $first: '$device' } } }, { $facet: {
      countries: [{ $group: { _id: '$country', visitors: { $sum: 1 } } }, { $sort: { visitors: -1, _id: 1 } }],
      devices: [{ $group: { _id: '$device', visitors: { $sum: 1 } } }, { $sort: { visitors: -1, _id: 1 } }],
    } }]),
    Click.aggregate([{ $match: match }, { $group: { _id: { date: { $dateToString: { format: range === 'all' ? '%Y-%m' : '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, type: '$type' }, count: { $sum: 1 }, visitors: { $addToSet: visitorKey } } }, { $sort: { '_id.date': 1 } }]),
    Product.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter), activeSnapshot(),
  ]);
  const grouped = await Click.aggregate([
    { $match: { ...match, refId: { $in: items.map(item => item._id) }, type: { $in: ['product_view', 'product_click'] } } },
    { $group: { _id: { product: '$refId', type: '$type' }, count: { $sum: 1 }, visitors: { $addToSet: visitorKey } } },
  ]);
  const byType = Object.fromEntries(counts.map(row => [row._id, row]));
  const values = type => byType[type]?.count || 0;
  const unique = type => byType[type]?.visitors.length || 0;
  const productViews = values('product_view'); const productClicks = values('product_click');
  const outboundClicks = productClicks + (productId ? 0 : values('offer_click'));
  const seriesMap = new Map();
  const blank = date => ({ date, visitors: 0, pageViews: 0, productViews: 0, outboundClicks: 0 });
  // Include zero-traffic days so charts do not imply continuous activity.
  if (start) for (let date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) { const key = date.toISOString().slice(0, 10); seriesMap.set(key, blank(key)); }
  for (const row of daily) {
    const key = row._id.date; if (!seriesMap.has(key)) seriesMap.set(key, blank(key));
    const entry = seriesMap.get(key);
    if (row._id.type === 'visit') { entry.pageViews = row.count; entry.visitors = row.visitors.length; }
    if (row._id.type === 'product_view') { entry.productViews = row.count; if (productId) entry.visitors = row.visitors.length; }
    if (['product_click', 'offer_click'].includes(row._id.type)) entry.outboundClicks += row.count;
  }
  const productRows = items.map(item => {
    const views = grouped.find(row => String(row._id.product) === String(item._id) && row._id.type === 'product_view');
    const clicks = grouped.find(row => String(row._id.product) === String(item._id) && row._id.type === 'product_click');
    return { _id: item._id, name: item.name, imageUrl: item.imageUrl, status: item.status, views: views?.count || 0, uniqueViewers: views?.visitors.length || 0, outboundClicks: clicks?.count || 0, uniqueClickers: clicks?.visitors.length || 0,
      clickThroughRate: percent(clicks?.count || 0, views?.count || 0) };
  });
  const countries = countryRows(audience[0]?.countries || []);
  res.set('Cache-Control', 'private, no-store');
  res.json({ range, from: start?.toISOString() || null, to: end.toISOString(), timezone: 'UTC', product, active,
    totals: { visitors: unique(productId ? 'product_view' : 'visit'), sessions: byType[productId ? 'product_view' : 'visit']?.sessions.filter(Boolean).length || 0,
      pageViews: values('visit'), productViews, uniqueProductViewers: unique('product_view'), outboundClicks, productClicks, clickThroughRate: percent(productClicks, productViews) },
    countries, devices: (audience[0]?.devices || []).map(row => ({ device: row._id || 'unknown', visitors: row.visitors })),
    series: [...seriesMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    products: { items: productRows, pagination: { page, pages: Math.ceil(total / limit), total } },
  });
};
module.exports = { getActive, getAnalytics };
