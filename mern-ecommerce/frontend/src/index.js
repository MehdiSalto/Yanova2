import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const Notifications = () => {
  const { theme } = useTheme();
  return <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme={theme} />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
      <App />
      <Notifications />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
