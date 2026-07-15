import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiPackage, FiTag, FiImage, FiMessageSquare, FiSettings, FiLogOut, FiMenu, FiX,
} from 'react-icons/fi';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: FiHome, end: true },
  { path: '/admin/products', label: 'Products', icon: FiPackage },
  { path: '/admin/offers', label: 'Offers', icon: FiTag },
  { path: '/admin/banners', label: 'Banners', icon: FiImage },
  { path: '/admin/contacts', label: 'Contacts', icon: FiMessageSquare },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-900 border-r border-white/10 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <span className="font-black text-xl tracking-tight">
            YAN<span className="text-gold-500">OVA</span>
          </span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.end
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-gold-500/15 text-gold-400' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <p className="text-white/40 text-xs px-4 mb-2 truncate">{admin?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/10 flex items-center px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/70">
            {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
