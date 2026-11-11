const jwt = require('jsonwebtoken');
const cookieOptions = () => {
  const production = process.env.NODE_ENV === 'production';
  // The production client and API use different sites (Cloudflare Pages and Railway).
  // Cross-site cookies require SameSite=None and Secure.
  const sameSite = production
    ? 'none'
    : String(process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  if (!['lax', 'strict', 'none'].includes(sameSite)) {
    throw new Error('Invalid COOKIE_SAME_SITE. Use lax, strict, or none.');
  }
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || production || sameSite === 'none',
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
