import { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const storageKey = 'yanoben:theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#10141b' : '#ffffff');
    try { localStorage.setItem(storageKey, theme); } catch { /* Storage is optional. */ }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(value => value === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
