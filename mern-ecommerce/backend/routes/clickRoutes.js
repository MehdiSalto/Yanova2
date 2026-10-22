const express = require('express');
const { body } = require('express-validator');
const { registerVisit, heartbeat, registerViews } = require('../controllers/clickController');
const { optionalAuth } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { trackingLimiter } = require('../middleware/security');
const v = require('../middleware/validators');
const validate = require('../middleware/validate');
const wrap = require('../utils/asyncHandler');
const router = express.Router();
router.post('/views', trackingLimiter, csrfProtection, optionalAuth,
  body('events').isArray({ min: 1, max: 25 }),
  body('events.*.productId').isMongoId(),
  body('events.*.eventId').isString().bail().matches(/^[a-zA-Z0-9_-]{16,140}$/),
  v.tracking, validate, wrap(registerViews));
router.post('/visit', trackingLimiter, csrfProtection, optionalAuth, body('path').isString().bail().matches(/^\/(?!\/)/).isLength({ max: 1024 }), v.tracking, validate, wrap(registerVisit));
router.post('/heartbeat', trackingLimiter, csrfProtection, optionalAuth, body('path').isString().bail().matches(/^\/(?!\/)/).isLength({ max: 1024 }), v.tracking, validate, wrap(heartbeat));
module.exports = router;
