import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, fetchCsrfToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await fetchCsrfToken();
      try {
        const { data } = await authAPI.me();
        setAdmin(data.admin);
      } catch (error) {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password);
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    await authAPI.logout();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
