import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboardAPI, productsAPI, offersAPI, contactsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import Loading from '../components/Loading';
import { FiPackage, FiTag, FiMail, FiUsers, FiTrendingUp, FiPlus } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-strong p-6 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-dark-400 text-sm">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  </motion.div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { liveUsers } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, productsRes, contactsRes] = await Promise.all([
          dashboardAPI.getStats(),
          productsAPI.getAll(),
          contactsAPI.getAll(),
        ]);
        setStats(statsRes.data);
        setRecentProducts(productsRes.data.slice(0, 5));
        setRecentContacts(contactsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  const statCards = [
    { icon: FiPackage, label: 'Total Products', value: stats?.totalProducts || 0, color: 'bg-gold-500/20 text-gold-400' },
    { icon: FiTag, label: 'Active Offers', value: stats?.activeOffers || 0, color: 'bg-blue-500/20 text-blue-400' },
    { icon: FiMail, label: 'New Messages', value: stats?.newContacts || 0, color: 'bg-green-500/20 text-green-400' },
    { icon: FiUsers, label: 'Live Visitors', value: liveUsers, color: 'bg-purple-500/20 text-purple-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="text-3xl font-black">Dashboard</h1>
        </div>
        <Link to="/products" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-strong p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiPackage className="text-gold-400" /> Recent Products
          </h2>
          <div className="space-y-3">
            {recentProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-dark-400 text-sm">{p.category}</p>
                  </div>
                </div>
                <span className="text-gold-400 font-semibold">${p.price}</span>
              </div>
            ))}
            {recentProducts.length === 0 && <p className="text-dark-400">No products yet.</p>}
          </div>
        </div>

        <div className="glass-strong p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiMail className="text-green-400" /> Recent Messages
          </h2>
          <div className="space-y-3">
            {recentContacts.map((c) => (
              <div key={c._id} className="p-3 bg-dark-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.name}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      c.status === 'new'
                        ? 'bg-green-500/20 text-green-400'
                        : c.status === 'replied'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-dark-700 text-dark-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-dark-400 text-sm truncate">{c.message}</p>
              </div>
            ))}
            {recentContacts.length === 0 && <p className="text-dark-400">No messages yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
