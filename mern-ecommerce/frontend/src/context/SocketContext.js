import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [liveUsers, setLiveUsers] = useState(0);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const handleLiveUsers = (count) => setLiveUsers(count);
    const handleAnalyticsUpdate = (payload) => {
      setAnalytics((prev) => ({ ...prev, ...payload }));
    };

    socket.on('analytics:liveUsers', handleLiveUsers);
    socket.on('analytics:update', handleAnalyticsUpdate);

    return () => {
      socket.off('analytics:liveUsers', handleLiveUsers);
      socket.off('analytics:update', handleAnalyticsUpdate);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ liveUsers, analytics }}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
