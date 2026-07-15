const express = require('express');
const { getSettings, updateAbout, updatePolicies } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSettings);
router.put('/about', protect, updateAbout);
router.put('/policies', protect, updatePolicies);

module.exports = router;
