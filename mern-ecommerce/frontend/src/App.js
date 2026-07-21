import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import OffersPage from './pages/OffersPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PoliciesPage from './pages/PoliciesPage';

const App = () => {
  return (
    <Router>
      <Routes>
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
    </Router>
  );
};

export default App;
