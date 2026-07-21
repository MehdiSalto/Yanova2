import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLoginPage = () => {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (admin) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gold-400">YANOVA</h1>
          <p className="text-dark-400 mt-2">Admin Panel Sign In</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-dark-300 mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-10"
                placeholder="admin@yanova.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-dark-500 text-xs mt-6">
          Authorized personnel only. Activity is monitored.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
