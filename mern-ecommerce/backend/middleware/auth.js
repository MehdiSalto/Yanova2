const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const authenticate = async (cookies) => {
  if (!cookies?.accessToken) return null;
  let decoded;
  try { decoded = jwt.verify(cookies.accessToken, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }); }
  catch { return null; }
  if (typeof decoded.id !== 'string' || !/^[a-f\d]{24}$/i.test(decoded.id)) return null;
  const admin = await Admin.findById(decoded.id);
  return admin && (admin.sessionVersion || 0) === (decoded.sv || 0) ? admin : null;
};
const protect = asyncHandler(async (req, res, next) => {
  req.admin = await authenticate(req.cookies);
  if (!req.admin) throw httpError(401, 'Your session has expired. Please sign in again.', 'UNAUTHENTICATED');
  next();
});
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin?.role)) return next(httpError(403, 'You do not have permission for this action.', 'FORBIDDEN'));
  next();
};
const optionalAuth = asyncHandler(async (req, res, next) => { req.admin = await authenticate(req.cookies); next(); });
module.exports = { protect, requireRole, authenticate, optionalAuth };
