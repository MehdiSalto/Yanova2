const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { applySecurity, sanitize } = require('./middleware/security');
const { issueCsrfToken } = require('./middleware/csrf');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { uploadsPath } = require('./config/uploads');
const createApp = () => {
  const app = express();
  const hops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (hops > 0 && Number.isInteger(hops)) app.set('trust proxy', hops);
  applySecurity(app);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(sanitize); app.use(cookieParser());
  app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ready' : 'unavailable' }));
  app.get('/api/csrf-token', issueCsrfToken);
  for (const [prefix, filename] of [['auth','auth'],['products','product'],['offers','offer'],['banners','banner'],['contacts','contact'],['sponsorships','sponsorship'],['settings','settings'],['dashboard','dashboard'],['clicks','click'],['upload','upload']]) {
    app.use(`/api/${prefix}`, require(`./routes/${filename}Routes`));
  }
  app.use('/api', notFound);
  app.use('/uploads', express.static(uploadsPath(), { maxAge: '1y', immutable: true, dotfiles: 'deny' }), notFound);
  if (process.env.NODE_ENV === 'production') {
    const adminBuild = path.join(__dirname, '..', 'admin', 'dist');
    const storeBuild = path.join(__dirname, '..', 'frontend', 'build');
    app.get('/admin', (req, res) => res.redirect('/admin/'));
    if (fs.existsSync(path.join(adminBuild, 'index.html'))) {
      app.use('/admin', express.static(adminBuild, { index: false }));
      app.get('/admin/*', (req, res) => res.sendFile(path.join(adminBuild, 'index.html')));
    } else app.use('/admin', notFound);
    if (fs.existsSync(path.join(storeBuild, 'index.html'))) {
      app.use(express.static(storeBuild));
      app.get('*', (req, res) => res.sendFile(path.join(storeBuild, 'index.html')));
    }
  }
  app.use(notFound); app.use(errorHandler); return app;
};
module.exports = createApp;
