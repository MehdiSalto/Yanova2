const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = app => {
  app.use(['/api','/uploads','/socket.io'], createProxyMiddleware({ target: 'http://localhost:5000', changeOrigin: true, ws: true }));
};
