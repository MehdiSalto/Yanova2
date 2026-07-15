const Banner = require('../models/Banner');

const getBanners = async (req, res) => {
  const isAdmin = !!req.admin;
  const filter = isAdmin ? {} : { active: true };
  const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
  res.json(banners);
};

const createBanner = async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json(banner);
};

const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  res.json(banner);
};

const deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  res.json({ message: 'Banner deleted' });
};

module.exports = { getBanners, createBanner, updateBanner, deleteBanner };
