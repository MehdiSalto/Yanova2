const { sendPublic, invalidatePublic } = require('../utils/publicCache');
const Banner = require('../models/Banner');
const { list, pick } = require('../utils/pagination');
const httpError = require('../utils/httpError');
const fields = ['title','imageUrl','linkUrl','position','active','order'];
const getBanners = async (req, res) => {
  const filter = req.management ? {} : { active: true };
  if (['hero','top','middle','footer'].includes(req.query.position)) filter.position = req.query.position;
  return sendPublic(req, res, 'banners', () => list(Banner, filter, req.query, { order: 1, createdAt: -1 }));
};
const createBanner = async (req, res) => { const banner = await Banner.create(pick(req.body, fields)); invalidatePublic('banners', req); res.status(201).json(banner); };
const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, { $set: pick(req.body, fields) }, { new: true, runValidators: true });
  if (!banner) throw httpError(404, 'Banner not found.'); invalidatePublic('banners', req); res.json(banner);
};
const deleteBanner = async (req, res) => { if (!await Banner.findByIdAndDelete(req.params.id)) throw httpError(404, 'Banner not found.'); invalidatePublic('banners', req); res.json({ message: 'Banner deleted.' }); };
module.exports = { getBanners, createBanner, updateBanner, deleteBanner };
