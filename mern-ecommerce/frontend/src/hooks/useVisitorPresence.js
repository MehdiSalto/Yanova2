import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { clickAPI } from '../services/api';
import { trackingInfo, sessionId } from '../services/tracking';
import { invalidateCatalog } from '../services/publicCatalog';

export default function useVisitorPresence(path) {
  const pathRef = useRef(path);
  pathRef.current = path;
  useEffect(() => {
    const origin = (process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL || window.location.origin).replace(/\/api\/?$/, '').replace(/\/$/, '');
    const socket = io(origin, { withCredentials: true, transports: ['websocket','polling'], tryAllTransports: true, auth: { role: 'visitor', sessionId: sessionId() } });
    let stopped = false; let pending = false; let lastSent = 0;
    const fallback = () => clickAPI.heartbeat(pathRef.current).catch(() => {});
    const ping = () => {
      if (stopped || pending || document.visibilityState !== 'visible' || Date.now() - lastSent < 45000) return;
      lastSent = Date.now(); pending = true;
      const payload = { ...trackingInfo(), path: pathRef.current };
      if (socket.connected) {
        socket.timeout(5000).emit('visitor:presence', payload, (error, response) => {
          pending = false;
          if (!stopped && (error || !response?.ok)) fallback();
        });
      } else fallback().finally(() => { pending = false; });
    };
    const connected = () => { lastSent = 0; ping(); };
    const changed = data => { if (typeof data?.revision === 'string') invalidateCatalog(data.revision); };
    socket.on('connect', connected); socket.on('catalog:update', changed);
    const timer = setInterval(ping, 60000);
    // registerVisit already records initial presence. Give the socket time to
    // connect before the fallback, avoiding a duplicate initial HTTP heartbeat.
    const initial = setTimeout(ping, 10000);
    document.addEventListener('visibilitychange', ping);
    return () => { stopped = true; clearTimeout(initial); clearInterval(timer); document.removeEventListener('visibilitychange', ping); socket.disconnect(); };
  }, []);
}
