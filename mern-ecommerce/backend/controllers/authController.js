const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../utils/generateTokens');

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  admin.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await admin.save();

  setAuthCookies(res, accessToken, refreshToken);
  res.json({ admin: { id: admin._id, email: admin.email, role: admin.role } });
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const admin = await Admin.findById(decoded.id).select('+refreshTokenHash');
    if (!admin || !admin.refreshTokenHash) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    const matches = await bcrypt.compare(token, admin.refreshTokenHash);
    if (!matches) return res.status(401).json({ message: 'Invalid session' });

    const accessToken = generateAccessToken(admin);
    const newRefreshToken = generateRefreshToken(admin);
    admin.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await admin.save();

    setAuthCookies(res, accessToken, newRefreshToken);
    res.json({ admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.id) {
        await Admin.findByIdAndUpdate(decoded.id, { $unset: { refreshTokenHash: 1 } });
      }
    }
  } finally {
    clearAuthCookies(res);
    res.json({ message: 'Logged out' });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  res.json({ admin: { id: req.admin._id, email: req.admin.email, role: req.admin.role } });
};

module.exports = { login, refresh, logout, me };
