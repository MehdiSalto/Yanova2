import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../services/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [liveUsers, setLiveUsers] = useState(0);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const onLiveUsers = (count) => setLiveUsers(count);
    const onAnalytics = (data) => setAnalytics(data);

    socket.on('analytics:liveUsers', onLiveUsers);
    socket.on('analytics', onAnalytics);

    return () => {
      socket.off('analytics:liveUsers', onLiveUsers);
      socket.off('analytics', onAnalytics);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ liveUsers, analytics }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
