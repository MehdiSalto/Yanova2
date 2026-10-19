const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');
const wrap = require('../utils/asyncHandler');
const router = express.Router();
router.get('/stats', protect, requireRole('admin','superadmin'), wrap(getStats));
module.exports = router;
