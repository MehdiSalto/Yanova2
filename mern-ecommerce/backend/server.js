require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { applySecurity, corsOptions } = require('./middleware/security');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const seedAdmin = require('./utils/seedAdmin');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const offerRoutes = require('./routes/offerRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const clickRoutes = require('./routes/clickRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });
app.set('io', io);

connectDB().then(seedAdmin);

applySecurity(app);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection (skipped for safe/GET requests automatically by csurf)
const csrfProtection = csurf({ cookie: { httpOnly: true, sameSite: 'lax' } });
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clicks', clickRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React production build
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

let liveUsers = 0;
io.on('connection', (socket) => {
  liveUsers += 1;
  io.emit('analytics:liveUsers', liveUsers);

  socket.on('disconnect', () => {
    liveUsers = Math.max(0, liveUsers - 1);
    io.emit('analytics:liveUsers', liveUsers);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
