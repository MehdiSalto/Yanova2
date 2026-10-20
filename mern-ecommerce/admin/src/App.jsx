import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AdminLayout from './layouts/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductAnalyticsPage from './pages/AdminProductAnalyticsPage';
import AdminOffersPage from './pages/AdminOffersPage';
import AdminBannersPage from './pages/AdminBannersPage';
import AdminContactsPage from './pages/AdminContactsPage';
import AdminSponsorshipsPage from './pages/AdminSponsorshipsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

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

  if (!admin) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<AdminLoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/:productId/analytics" element={<AdminProductAnalyticsPage />} />
              <Route path="offers" element={<AdminOffersPage />} />
              <Route path="banners" element={<AdminBannersPage />} />
              <Route path="contacts" element={<AdminContactsPage />} />
              <Route path="sponsorships" element={<AdminSponsorshipsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
