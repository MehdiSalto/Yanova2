const Product = require('../models/Product');
const Click = require('../models/Click');
const { list, search, pick } = require('../utils/pagination');
const httpError = require('../utils/httpError');
const { notifyAdmins } = require('../utils/events');
const { shouldTrack, trackingFields } = require('../utils/analytics');
const fields = ['name','description','price','discount','imageUrl','gallery','buyLink','category','featured','status','stock','colors','sizes'];
const getProducts = async (req, res) => {
  const filter = req.management ? {} : { status: 'published' };
  const term = search(req.query.search);
  if (term) filter.$or = [{ name: term }, { description: term }];
  if (typeof req.query.category === 'string' && req.query.category) filter.category = req.query.category.slice(0,80);
  if (req.management && ['draft','published'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.featured === 'true') filter.featured = true;
  res.json(await list(Product, filter, req.query));
};
const getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, ...(!req.management ? { status: 'published' } : {}) });
  if (!product) throw httpError(404, 'Product not found.');
  res.json(product);
};
const createProduct = async (req, res) => {
  const product = await Product.create(pick(req.body, fields));
  notifyAdmins(req, 'analytics:update', { type: 'catalog' });
  res.status(201).json(product);
};
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $set: pick(req.body, fields) }, { new: true, runValidators: true });
  if (!product) throw httpError(404, 'Product not found.');
  notifyAdmins(req, 'analytics:update', { type: 'catalog' });
  res.json(product);
};
const deleteProduct = async (req, res) => {
  if (!await Product.findByIdAndDelete(req.params.id)) throw httpError(404, 'Product not found.');
  notifyAdmins(req, 'analytics:update', { type: 'catalog' }); res.json({ message: 'Product deleted.' });
};
const registerClick = async (req, res) => {
  if (!shouldTrack(req)) return res.status(204).end();
  const product = await Product.findOne({ _id: req.params.id, status: 'published' });
  if (!product) throw httpError(404, 'Product not found.');
  try { await Click.create({ type: 'product_click', refId: product._id, ...trackingFields(req) }); }
  catch (error) { if (error.code === 11000) return res.json({ clickCount: product.clickCount, duplicate: true }); throw error; }
  const updated = await Product.findByIdAndUpdate(product._id, { $inc: { clickCount: 1 } }, { new: true });
  notifyAdmins(req, 'analytics:update', { type: 'product_click' });
  res.json({ clickCount: updated?.clickCount || product.clickCount + 1 });
};
const registerView = async (req, res) => {
  if (!shouldTrack(req)) return res.status(204).end();
  const product = await Product.findOne({ _id: req.params.id, status: 'published' });
  if (!product) throw httpError(404, 'Product not found.');
  try { await Click.create({ type: 'product_view', refId: product._id, ...trackingFields(req) }); }
  catch (error) { if (error.code === 11000) return res.json({ duplicate: true }); throw error; }
  notifyAdmins(req, 'analytics:update', { type: 'product_view' });
  res.status(201).json({ message: 'Product view recorded.' });
};
module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, registerClick, registerView };
