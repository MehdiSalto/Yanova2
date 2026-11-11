const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const validateEnvironment = () => {
  require('../services/imageStorage').cloudinaryConfig();
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required. Run npm run setup and configure backend/.env.');
  const secret = process.env.JWT_ACCESS_SECRET || '';
  if (secret.length < 32 || /changeme|replace|example/i.test(secret)) {
    throw new Error('JWT_ACCESS_SECRET must be a random secret of at least 32 characters. Run npm run setup.');
  }
  const railwayProduction = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID);
  const production = process.env.NODE_ENV === 'production' || railwayProduction;
  const sameSite = String(process.env.COOKIE_SAME_SITE || (production ? 'none' : 'lax')).toLowerCase();
  if (!['lax', 'strict', 'none'].includes(sameSite)) {
    throw new Error('COOKIE_SAME_SITE must be lax, strict, or none.');
  }
  if (sameSite === 'none' && !production && process.env.COOKIE_SECURE !== 'true') {
    throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true and HTTPS.');
  }
};
module.exports = { validateEnvironment };
