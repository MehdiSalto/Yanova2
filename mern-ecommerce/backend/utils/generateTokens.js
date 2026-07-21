const jwt = require('jsonwebtoken');

const TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '24h';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const generateAccessToken = (admin) =>
  jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: TOKEN_EXPIRES,
  });

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  path: '/',
});

const setAuthCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions(),
    maxAge: TOKEN_MAX_AGE_MS,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie('accessToken', cookieOptions());
};

module.exports = { generateAccessToken, setAuthCookie, clearAuthCookie };
