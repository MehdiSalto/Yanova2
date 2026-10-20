import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
  return <button type="button" onClick={toggleTheme} aria-label={label} title={label} aria-pressed={theme === 'dark'} className="theme-toggle">
    {theme === 'light' ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
    <span className="hidden lg:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
  </button>;
}
