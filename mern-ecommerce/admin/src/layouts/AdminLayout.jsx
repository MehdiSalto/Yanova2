import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  FiGrid,
  FiPackage,
  FiTag,
  FiImage,
  FiMail,
  FiSettings,
  FiLogOut,
  FiUsers,
} from 'react-icons/fi';

const navItems = [
  { to: '/', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/products', label: 'Products', icon: FiPackage },
  { to: '/offers', label: 'Offers', icon: FiTag },
  { to: '/banners', label: 'Banners', icon: FiImage },
  { to: '/contacts', label: 'Contacts', icon: FiMail },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const { liveUsers } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-dark-950">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-dark-800">
          <h1 className="text-2xl font-black text-gold-400">YANOVA</h1>
          <p className="text-xs text-dark-400 tracking-widest uppercase">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500 text-dark-950 font-semibold'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-800 space-y-3">
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <FiUsers className="w-4 h-4" />
            <span>{liveUsers} online now</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="text-white font-medium truncate">{admin?.email}</p>
              <p className="text-dark-400 text-xs capitalize">{admin?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-dark-800 text-dark-300 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
