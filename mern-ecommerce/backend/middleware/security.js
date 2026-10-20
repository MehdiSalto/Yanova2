const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const httpError = require('../utils/httpError');
const allowedOrigins = () => (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:5174')
  .split(',').map((value) => value.trim()).filter(Boolean);
const isAllowedOrigin = (origin) => !origin || allowedOrigins().includes(origin);
const corsOptions = {
  origin: (origin, callback) => callback(isAllowedOrigin(origin) ? null : httpError(403, 'Origin is not allowed.', 'ORIGIN_NOT_ALLOWED'), isAllowedOrigin(origin)),
  credentials: true,
};
const limiter = (max, windowMs, message) => rateLimit({
  windowMs, max, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { message, code: 'RATE_LIMITED' },
});
const authLimiter = limiter(20, 15 * 60 * 1000, 'Too many sign-in attempts. Please try later.');
const contactLimiter = limiter(10, 15 * 60 * 1000, 'Too many messages. Please try later.');
const sponsorshipLimiter = limiter(10, 15 * 60 * 1000, 'Too many sponsorship requests. Please try again later.');
const trackingLimiter = limiter(180, 60 * 1000, 'Too many tracking requests.');
const uploadLimiter = limiter(30, 15 * 60 * 1000, 'Too many uploads. Please try later.');
const applySecurity = (app) => {
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: { directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'https:', 'data:', 'blob:'],
      connectSrc: ["'self'", ...allowedOrigins(), ...(process.env.API_PUBLIC_URL ? [process.env.API_PUBLIC_URL] : [])],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    } },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cors(corsOptions));
};
// Run after body parsers so JSON and form bodies are included.
const sanitize = mongoSanitize({ replaceWith: '_' });
module.exports = { applySecurity, sanitize, corsOptions, isAllowedOrigin, authLimiter, contactLimiter, sponsorshipLimiter, trackingLimiter, uploadLimiter };
