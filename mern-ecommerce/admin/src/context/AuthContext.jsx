import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, clearCsrfToken } from '../services/api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState('');
  useEffect(() => {
    let active = true;
    authAPI.me().then(({ data }) => { if (active) setAdmin(data.admin); }).catch(error => {
      if (active && error.response?.status !== 401) setConnectionError('Unable to reach the server. Check the connection and try again.');
    }).finally(() => { if (active) setLoading(false); });
    const expire = () => { clearCsrfToken(); setAdmin(null); };
    window.addEventListener('yanova:session-expired', expire);
    return () => { active = false; window.removeEventListener('yanova:session-expired', expire); };
  }, []);
  const login = async (email, password) => { const { data } = await authAPI.login(email, password); setAdmin(data.admin); setConnectionError(''); return data; };
  const changePassword = async values => { const { data } = await authAPI.password(values); setAdmin(data.admin); return data; };
  const logout = async () => { await authAPI.logout(); setAdmin(null); };
  return <AuthContext.Provider value={{ admin, loading, login, logout, changePassword, connectionError }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
