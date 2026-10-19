const jwt = require('jsonwebtoken');
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  path: '/',
});
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
