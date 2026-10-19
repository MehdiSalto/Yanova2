import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import socket from '../services/socket';
const SocketContext = createContext(null);
export const SocketProvider = ({ children }) => {
  const { admin } = useAuth();
  const [liveUsers, setLiveUsers] = useState(0);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!admin) { socket.disconnect(); setLiveUsers(0); return; }
    const live = count => setLiveUsers(count);
    const update = () => setRevision(value => value + 1);
    const connectError = error => { if (error.message === 'Sign in to view analytics.') window.dispatchEvent(new Event('yanova:session-expired')); };
    const disconnect = reason => { setLiveUsers(0); if (reason === 'io server disconnect') window.dispatchEvent(new Event('yanova:session-expired')); };
    socket.on('analytics:liveUsers', live); socket.on('analytics:update', update);
    socket.on('connect_error', connectError); socket.on('disconnect', disconnect); socket.connect();
    return () => { socket.off('analytics:liveUsers', live); socket.off('analytics:update', update); socket.off('connect_error', connectError); socket.off('disconnect', disconnect); socket.disconnect(); };
  }, [admin]);
  return <SocketContext.Provider value={{ liveUsers, revision }}>{children}</SocketContext.Provider>;
};
export const useSocket = () => useContext(SocketContext);
