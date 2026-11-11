const jwt = require('jsonwebtoken');
const isProduction = () => process.env.NODE_ENV === 'production'
  || Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID);
const cookieOptions = () => {
  const production = isProduction();
  // Cloudflare Pages and Railway are cross-site in production.
  const sameSite = production
    ? 'none'
    : String(process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  if (!['lax', 'strict', 'none'].includes(sameSite)) {
    throw new Error('Invalid COOKIE_SAME_SITE. Use lax, strict, or none.');
  }
  return {
    httpOnly: true,
    secure: production || process.env.COOKIE_SECURE === 'true' || sameSite === 'none',
    sameSite,
    path: '/',
  };
};
const generateAccessToken = (admin) => jwt.sign(
  { id: String(admin._id), role: admin.role, sv: admin.sessionVersion || 0 }, process.env.JWT_ACCESS_SECRET,
  { algorithm: 'HS256', expiresIn: process.env.JWT_ACCESS_EXPIRES || '8h' }
);
const setAuthCookie = (res, token) => {
  const { exp } = jwt.decode(token);
  res.cookie('accessToken', token, { ...cookieOptions(), maxAge: Math.max(0, exp * 1000 - Date.now()) });
};
const clearAuthCookie = (res) => res.clearCookie('accessToken', cookieOptions());
module.exports = { generateAccessToken, setAuthCookie, clearAuthCookie, cookieOptions };
