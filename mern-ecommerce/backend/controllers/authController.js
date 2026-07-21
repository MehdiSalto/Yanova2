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

module.exports = { login, logout, me };
