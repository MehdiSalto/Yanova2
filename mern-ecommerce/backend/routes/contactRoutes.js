const express = require('express');
const { body } = require('express-validator');
const {
  submitContact,
  getContacts,
  markAsRead,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const contactValidation = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject too short'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message too short'),
];

router.post('/', contactValidation, validate, submitContact);
router.get('/', protect, getContacts);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteContact);

module.exports = router;
