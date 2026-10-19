const { body, param } = require('express-validator');
const validate = require('./validate');
const webUrl = (value) => {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password; }
  catch { return false; }
};
const imageUrl = (value) => webUrl(value) || (typeof value === 'string' && /^\/uploads\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g|gif)$/.test(value));
const linkUrl = (value) => webUrl(value) || (typeof value === 'string' && /^\/(?!\/)[\w/?&=.#%-]*$/.test(value));
const text = (key, min, max, optional = false) => {
  const rule = body(key); if (optional) rule.optional();
  return rule.isString().bail().trim().isLength({ min, max }).withMessage(`${key} must contain ${min}-${max} characters`);
};
const id = [param('id').isMongoId().withMessage('Invalid resource identifier'), validate];
const bool = (key) => body(key).optional().isBoolean().bail().toBoolean();
const product = [
  text('name', 1, 200), text('description', 1, 20000),
  body('price').isFloat({ min: 0, max: 100000000 }).bail().toFloat(),
  body('discount').optional().isFloat({ min: 0, max: 100 }).bail().toFloat(),
  body('imageUrl').custom(imageUrl).withMessage('A valid image URL or uploaded image is required'),
  body('buyLink').custom(webUrl).withMessage('Buy link must use http or https'),
  body('gallery').optional().isArray({ max: 20 }), body('gallery.*').custom(imageUrl),
  text('category', 1, 80, true), bool('featured'),
  body('status').optional().isIn(['draft', 'published']),
  body('stock').optional({ nullable: true }).isInt({ min: 0, max: 100000000 }).bail().toInt(),
  body('colors').optional().isArray({ max: 30 }), body('sizes').optional().isArray({ max: 30 }),
  text('colors.*', 1, 60, true), text('sizes.*', 1, 60, true), validate,
];
const offer = [
  text('title', 1, 200), text('description', 1, 20000),
  body('imageUrl').custom(imageUrl), body('offerLink').custom(webUrl),
  body('discountPercentage').isFloat({ min: 0, max: 100 }).bail().toFloat(),
  text('ctaText', 1, 60, true), text('code', 0, 50, true),
  body('status').optional().isIn(['draft', 'published']),
  body('startsAt').optional({ nullable: true }).isISO8601(), body('expiresAt').optional({ nullable: true }).isISO8601(),
  body('expiresAt').custom((value, { req }) => !value || !req.body.startsAt || new Date(value) > new Date(req.body.startsAt)).withMessage('Expiry must be after the start date'), validate,
];
const banner = [
  text('title', 1, 200), body('imageUrl').custom(imageUrl),
  body('linkUrl').optional({ checkFalsy: true }).custom(linkUrl),
  body('position').optional().isIn(['hero', 'top', 'middle', 'footer']), bool('active'),
  body('order').optional().isInt({ min: 0, max: 9999 }).bail().toInt(), validate,
];
const tracking = [
  body('device').isIn(['desktop', 'mobile', 'tablet']),
  body('sessionId').isString().bail().matches(/^[a-zA-Z0-9_-]{16,80}$/),
  body('eventId').isString().bail().matches(/^[a-zA-Z0-9_-]{16,140}$/), validate,
];
module.exports = { webUrl, imageUrl, linkUrl, text, id, bool, product, offer, banner, tracking };
