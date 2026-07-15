const Product = require('../models/Product');
const Click = require('../models/Click');

const getProducts = async (req, res) => {
  const isAdmin = !!req.admin;
  const filter = isAdmin ? {} : { status: 'published' };
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
};

const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
};

const registerClick = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { clickCount: 1 } },
    { new: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await Click.create({ type: 'product_click', refId: product._id, device: req.body.device });
  const io = req.app.get('io');
  io?.emit('analytics:update', { type: 'product_click', productId: product._id });
  res.json({ clickCount: product.clickCount });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, registerClick };
