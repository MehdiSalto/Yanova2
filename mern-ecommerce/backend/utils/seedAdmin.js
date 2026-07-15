const Admin = require('../models/Admin');

const seedAdmin = async () => {
  const count = await Admin.countDocuments();
  if (count > 0) return;

  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@yanova.com';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';

  await Admin.create({ email, password, role: 'superadmin' });
  console.log(`Seeded default admin: ${email}`);
};

module.exports = seedAdmin;
