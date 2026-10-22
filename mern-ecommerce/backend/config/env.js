const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const validateEnvironment = () => {
  require('../services/imageStorage').cloudinaryConfig();
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required. Run npm run setup and configure backend/.env.');
  const secret = process.env.JWT_ACCESS_SECRET || '';
  if (secret.length < 32 || /changeme|replace|example/i.test(secret)) {
    throw new Error('JWT_ACCESS_SECRET must be a random secret of at least 32 characters. Run npm run setup.');
  }
  if (process.env.COOKIE_SAME_SITE === 'none' && process.env.COOKIE_SECURE !== 'true') {
    throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true and HTTPS.');
  }
  if (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'true') {
    throw new Error('Production requires COOKIE_SECURE=true and HTTPS.');
  }
};
module.exports = { validateEnvironment };
