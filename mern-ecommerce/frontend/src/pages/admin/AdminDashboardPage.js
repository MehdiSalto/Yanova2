import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { dashboardAPI } from '../../services/api';
import { LoadingSpinner } from '../../components/Loading';
import {
  FiPackage, FiUsers, FiMousePointer, FiDollarSign, FiTrendingUp, FiActivity,
  FiClock, FiGlobe, FiAlertCircle, FiMonitor, FiSmartphone, FiTablet,
} from 'react-icons/fi';

const AdminDashboardPage = () => {
  const { admin } = useAuth();
  const { liveUsers } = useSocket();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device) => {
    if (device === 'mobile') return FiSmartphone;
    if (device === 'tablet') return FiTablet;
    return FiMonitor;
  };

  if (loading) return <LoadingSpinner size="xl" className="min-h-screen" />;

  const cards = [
    { icon: FiPackage, color: 'blue', label: 'Total Products', value: stats?.totalProducts || 0, sub: `${stats?.draftProducts || 0} drafts` },
    { icon: FiUsers, color: 'green', label: 'Total Visits', value: stats?.totalVisits || 0, sub: `Live: ${liveUsers}` },
    { icon: FiMousePointer, color: 'yellow', label: 'Total Clicks', value: stats?.totalClicks || 0, sub: `Rate: ${stats?.clickRate || 0}%` },
    { icon: FiDollarSign, color: 'purple', label: 'Active Offers', value: stats?.activeOffers || 0, sub: `${stats?.activeBanners || 0} banners` },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-black text-white mb-2">Welcome back, {admin?.email}!</h1>
          <p className="text-white/60">Here's your dashboard overview</p>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 mb-8">
            <FiAlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              className="bg-dark-900 border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-gold-500" />
                </div>
                <FiTrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-1">{card.value}</h3>
              <p className="text-white/60 text-sm">{card.label}</p>
              <p className="mt-4 text-xs text-white/40">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            className="bg-dark-900 border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiActivity className="text-gold-500" /> Live Analytics
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-sm text-white/60"><FiUsers className="w-4 h-4" /> Live Users</div>
                <p className="text-xl font-black text-white">{liveUsers}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-sm text-white/60"><FiClock className="w-4 h-4" /> Total Visits</div>
                <p className="text-xl font-black text-white">{stats?.totalVisits || 0}</p>
              </div>
            </div>
            <h3 className="text-sm font-medium text-white/70 mb-3">Device Types</h3>
            <div className="space-y-2">
              {stats?.deviceStats?.length > 0 ? (
                stats.deviceStats.map((device) => {
                  const Icon = getDeviceIcon(device._id);
                  return (
                    <div key={device._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60 text-sm capitalize">
                        <Icon className="w-4 h-4" /> {device._id}
                      </div>
                      <span className="text-white text-sm font-medium">{device.count}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-white/40 text-sm">No device data yet</p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="bg-dark-900 border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FiGlobe className="text-green-400" /> Top Products
            </h2>
            {stats?.topProducts?.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, i) => (
                  <div key={product._id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-sm">
                      {i + 1}
                    </div>
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{product.name}</h4>
                      <p className="text-white/40 text-xs">${product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{product.clickCount}</p>
                      <p className="text-white/40 text-xs">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiPackage className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No products found</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
