const { Server } = require('socket.io');
const cookie = require('cookie');
const { corsOptions, isAllowedOrigin } = require('./middleware/security');
const { authenticate } = require('./middleware/auth');
const { recordPresence, shouldTrack } = require('./utils/analytics');
const attachSockets = (server, app) => {
  const io = new Server(server, { cors: corsOptions, maxHttpBufferSize: 10000 });
  app.set('io', io);
  const visitors = new Map();
  const publishCount = () => io.to('admins').emit('analytics:liveUsers', visitors.size);
  io.use(async (socket, next) => {
    try {
      if (!isAllowedOrigin(socket.handshake.headers.origin)) return next(new Error('Origin is not allowed.'));
      const admin = await authenticate(cookie.parse(socket.handshake.headers.cookie || ''));
      if (socket.handshake.auth?.role === 'admin') {
        if (!admin) return next(new Error('Sign in to view analytics.'));
        socket.data.admin = admin; return next();
      }
      if (admin) { socket.data.excludedAdmin = true; return next(); }
      const id = socket.handshake.auth?.sessionId;
      if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{16,80}$/.test(id)) return next(new Error('Invalid visitor session.'));
      socket.data.sessionId = id; next();
    } catch { next(new Error('Unable to connect.')); }
  });
  io.on('connection', (socket) => {
    if (socket.data.admin) {
      socket.join('admins'); socket.emit('analytics:liveUsers', visitors.size);
      // Re-check the signed cookie on a bounded timer; expired admins cannot
      // keep receiving private events after the HTTP session expires.
      const timer = setInterval(async () => {
        try { if (!await authenticate(cookie.parse(socket.handshake.headers.cookie || ''))) socket.disconnect(true); }
        catch { socket.disconnect(true); }
      }, 60000);
      timer.unref(); socket.on('disconnect', () => clearInterval(timer)); return;
    }
    const id = socket.data.sessionId;
    if (!id) return;
    visitors.set(id, (visitors.get(id) || 0) + 1); publishCount();
    let lastPresence = 0; let pendingPresence = false;
    socket.on('visitor:presence', async (data, acknowledge) => {
      const reply = value => { if (typeof acknowledge === 'function') acknowledge(value); };
      if (!data || typeof data !== 'object' || typeof data.visitorId !== 'string' || !/^[a-zA-Z0-9_-]{16,80}$/.test(data.visitorId) ||
          !['desktop','tablet','mobile'].includes(data.device) || typeof data.path !== 'string' || !/^\/(?!\/)/.test(data.path) || data.path.length > 1024) return reply({ ok: false });
      if (pendingPresence || Date.now() - lastPresence < 45000) return reply({ ok: true });
      const req = { body: { ...data, sessionId: id }, get: name => socket.handshake.headers[name.toLowerCase()] };
      if (!shouldTrack(req)) return reply({ ok: true });
      pendingPresence = true;
      try { await recordPresence(req); lastPresence = Date.now(); reply({ ok: true }); }
      catch { reply({ ok: false }); }
      finally { pendingPresence = false; }
    });
    socket.on('disconnect', () => { const count = visitors.get(id) - 1; if (count <= 0) visitors.delete(id); else visitors.set(id, count); publishCount(); });
  });
  return io;
};
module.exports = attachSockets;
