const express = require('express');
const { body, query } = require('express-validator');
const c = require('../controllers/sponsorshipController');
const { fields, statuses } = require('../config/sponsorshipForm');
const { protect, requireRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { sponsorshipLimiter } = require('../middleware/security');
const v = require('../middleware/validators');
const validate = require('../middleware/validate');
const wrap = require('../utils/asyncHandler');
const router = express.Router();
const admin = [protect, requireRole('admin', 'superadmin'), csrfProtection];
const submission = fields.map(field => {
  let rule = body(field.key);
  if (!field.required) rule = rule.optional({ checkFalsy: true });
  rule = rule.isString().withMessage('Please enter text for this answer.').bail().trim().isLength({ min: field.minLength || 0, max: field.maxLength }).withMessage(`${field.label} Please enter ${field.minLength || 0}-${field.maxLength} characters.`).bail();
  if (field.type === 'email') rule = rule.isEmail().withMessage('Please enter a valid email address.');
  if (field.type === 'url') rule = rule.custom(v.webUrl).withMessage('Please enter an http or https URL.');
  return rule;
});
router.get('/form', c.getForm);
router.post('/', sponsorshipLimiter, csrfProtection, submission,
  body('submissionId').isString().bail().matches(/^[a-f0-9]{32}$/).withMessage('Please refresh the form and try again.'),
  body('contactConsent').equals('true').withMessage('Please confirm that we may contact you about this request.'),
  validate, wrap(c.submit));
router.get('/', ...admin, query('status').optional({ checkFalsy: true }).isIn(statuses), validate, wrap(c.getRequests));
router.patch('/:id', ...admin, v.id, body('status').optional().isIn(statuses), body('internalNotes').optional().isString().bail().isLength({ max: 5000 }), validate, wrap(c.update));
router.delete('/:id', ...admin, v.id, wrap(c.remove));
module.exports = router;
