const crypto = require('crypto');
const { cookieOptions } = require('../utils/generateTokens');
const httpError = require('../utils/httpError');
const COOKIE = 'yanobenCsrfSeed';
const hex = /^[a-f0-9]{64}$/;
// Signed token bound to a random HttpOnly cookie and the current login cookie.
const mac = (seed, nonce, accessToken = '') => crypto.createHmac('sha256', process.env.JWT_ACCESS_SECRET)
  .update(JSON.stringify([seed, nonce, crypto.createHash('sha256').update(accessToken).digest('hex')])).digest('hex');
const issueCsrfToken = (req, res) => {
  const existing = req.cookies?.[COOKIE];
  const seed = typeof existing === 'string' && hex.test(existing) ? existing : crypto.randomBytes(32).toString('hex');
  res.cookie(COOKIE, seed, cookieOptions());
  const nonce = crypto.randomBytes(32).toString('hex');
  res.set('Cache-Control', 'no-store').json({ csrfToken: `${nonce}.${mac(seed, nonce, req.cookies?.accessToken)}` });
};
const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const seed = req.cookies?.[COOKIE];
  const token = req.get('X-CSRF-Token') || req.get('CSRF-Token') || '';
  const [nonce, signature, extra] = token.split('.');
  if (typeof seed === 'string' && hex.test(seed) && hex.test(nonce || '') && hex.test(signature || '') && extra === undefined) {
    const expected = mac(seed, nonce, req.cookies?.accessToken);
    if (crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))) return next();
  }
  next(httpError(403, 'Security token expired. Please try again.', 'INVALID_CSRF'));
};
module.exports = { issueCsrfToken, csrfProtection };
