const express = require('express');
const { body } = require('express-validator');
const { getBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const bannerValidation = [body('title').notEmpty(), body('imageUrl').notEmpty()];

router.get('/', getBanners);
router.post('/', protect, bannerValidation, validate, createBanner);
router.put('/:id', protect, bannerValidation, validate, updateBanner);
router.delete('/:id', protect, deleteBanner);

module.exports = router;
