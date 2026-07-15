const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  registerClick,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const productValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
  body('buyLink').notEmpty().withMessage('Buy link is required'),
];

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/:id/click', registerClick);
router.post('/', protect, productValidation, validate, createProduct);
router.put('/:id', protect, productValidation, validate, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
