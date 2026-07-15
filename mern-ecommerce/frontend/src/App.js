import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminContactsPage from './pages/admin/AdminContactsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import HomePage from './pages/HomePage';
import OffersPage from './pages/OffersPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PoliciesPage from './pages/PoliciesPage';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="offers" element={<AdminOffersPage />} />
              <Route path="banners" element={<AdminBannersPage />} />
              <Route path="contacts" element={<AdminContactsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<HomePage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="policies" element={<PoliciesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
