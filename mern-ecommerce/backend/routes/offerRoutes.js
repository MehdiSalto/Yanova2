const express = require('express');
const { body } = require('express-validator');
const { getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const offerValidation = [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('imageUrl').notEmpty(),
  body('discountPercentage').isFloat({ min: 0, max: 100 }),
  body('offerLink').notEmpty(),
];

router.get('/', getOffers);
router.post('/', protect, offerValidation, validate, createOffer);
router.put('/:id', protect, offerValidation, validate, updateOffer);
router.delete('/:id', protect, deleteOffer);

module.exports = router;
