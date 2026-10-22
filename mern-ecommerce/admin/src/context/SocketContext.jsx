import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { dashboardAPI } from '../services/api';
import socket from '../services/socket';
const SocketContext = createContext(null);
export const SocketProvider = ({ children }) => {
  const { admin } = useAuth();
  const [active, setActive] = useState(null);
  const [revision, setRevision] = useState(0);
  const [presenceError, setPresenceError] = useState(false);
  useEffect(() => {
    if (!admin) { socket.disconnect(); setActive(null); return; }
    const abort = new AbortController(); let updateTimer; let liveTimer; let pending = false;
    const refresh = async () => {
      if (pending || abort.signal.aborted || document.visibilityState !== 'visible') return;
      pending = true;
      try { const { data } = await dashboardAPI.getActive({ signal: abort.signal }); setActive(data); setPresenceError(false); }
      catch { if (!abort.signal.aborted) setPresenceError(true); }
      finally { pending = false; }
    };
    const live = () => { clearTimeout(liveTimer); liveTimer = setTimeout(refresh, 5000); };
    const update = () => { if (!updateTimer && document.visibilityState === 'visible') updateTimer = setTimeout(() => { updateTimer = null; if (document.visibilityState !== 'visible') return; setRevision(value => value + 1); refresh(); }, 5000); };
    document.addEventListener('visibilitychange', update);
    const connectError = error => { if (error.message === 'Sign in to view analytics.') window.dispatchEvent(new Event('yanoben:session-expired')); };
    const disconnect = reason => { if (reason === 'io server disconnect') window.dispatchEvent(new Event('yanoben:session-expired')); };
    socket.on('analytics:liveUsers', live); socket.on('analytics:update', update);
    socket.on('connect_error', connectError); socket.on('disconnect', disconnect); socket.connect();
    refresh(); const interval = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 30000);
    return () => {
      abort.abort(); clearInterval(interval); clearTimeout(updateTimer); clearTimeout(liveTimer);
      document.removeEventListener('visibilitychange', update);
      socket.off('analytics:liveUsers', live); socket.off('analytics:update', update);
      socket.off('connect_error', connectError); socket.off('disconnect', disconnect); socket.disconnect();
    };
  }, [admin]);
  return <SocketContext.Provider value={{ active, liveUsers: active?.total ?? null, presenceError, revision }}>{children}</SocketContext.Provider>;
};
export const useSocket = () => useContext(SocketContext);
