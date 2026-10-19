const { validateEnvironment } = require('./config/env');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const createApp = require('./app');
const attachSockets = require('./socket');
const start = async () => {
  validateEnvironment();
  await connectDB(); await seedAdmin();
  const app = createApp(); const server = http.createServer(app); const io = attachSockets(server, app);
  server.listen(process.env.PORT || 5000, () => console.log(`YANOVA server listening on port ${process.env.PORT || 5000}`));
  const shutdown = () => {
    const timeout = setTimeout(() => process.exit(1), 10000); timeout.unref();
    io.close(); server.close(async () => { await mongoose.disconnect(); clearTimeout(timeout); process.exit(0); });
  };
  process.once('SIGINT', shutdown); process.once('SIGTERM', shutdown);
  return { app, server, io };
};
if (require.main === module) start().catch(async (error) => {
  console.error(error.name === 'MongooseServerSelectionError' ? 'Database connection failed. Check MONGO_URI and network access.' : error.message);
  await mongoose.disconnect(); process.exitCode = 1;
});
module.exports = start;
