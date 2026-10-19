const Admin = require('../models/Admin');
const seedAdmin = async () => {
  if (await Admin.countDocuments() > 0) return;
  const email = process.env.DEFAULT_ADMIN_EMAIL?.trim();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || '';
  if (!email || password.length < 12 || /^(Admin@123456|password|admin123)$/i.test(password)) {
    throw new Error('First startup requires DEFAULT_ADMIN_EMAIL and a unique DEFAULT_ADMIN_PASSWORD of at least 12 characters.');
  }
  await Admin.create({ email, password, role: 'superadmin' });
  console.log('Initial administrator created.');
};
module.exports = seedAdmin;
