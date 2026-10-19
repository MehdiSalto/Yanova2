const Admin = require('../models/Admin');
const { generateAccessToken, setAuthCookie, clearAuthCookie } = require('../utils/generateTokens');

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
  setAuthCookie(res, accessToken);
  res.json({ admin: { id: admin._id, email: admin.email, role: admin.role } });
};

// POST /api/auth/logout
const logout = async (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me
const me = async (req, res) => {
  res.json({ admin: { id: req.admin._id, email: req.admin.email, role: req.admin.role } });
};

const changePassword = async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('+password');
  if (!admin || !await admin.comparePassword(req.body.currentPassword)) return res.status(400).json({ message: 'Current password is incorrect.' });
  if (req.body.currentPassword === req.body.newPassword) return res.status(400).json({ message: 'Choose a different password.' });
  admin.password = req.body.newPassword; admin.sessionVersion = (admin.sessionVersion || 0) + 1;
  await admin.save(); setAuthCookie(res, generateAccessToken(admin));
  res.json({ admin: { id: admin._id, email: admin.email, role: admin.role }, message: 'Password changed. Other sessions have been signed out.' });
};
module.exports = { login, logout, me, changePassword };
