const express = require('express');
const { body } = require('express-validator');
const { login, logout, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().withMessage('Valid email required'), body('password').notEmpty()],
  validate,
  login
);
router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;
