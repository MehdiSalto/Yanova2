import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiUser, FiShoppingCart } from 'react-icons/fi';

const navLinks = [
  { path: '/', label: 'HOME' },
  { path: '/products', label: 'SHOP' },
  { path: '/offers', label: 'OFFERS' },
  { path: '/about', label: 'ABOUT US' },
  { path: '/contact', label: 'CONTACT' },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-black text-white text-[11px] sm:text-xs tracking-wide">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-6 sm:gap-10 overflow-x-auto whitespace-nowrap">
          <span>FREE SHIPPING ON ALL ORDERS OVER $50</span>
          <span className="hidden sm:inline">30-DAY EASY RETURNS</span>
          <span className="hidden md:inline">1-YEAR WARRANTY</span>
          <span className="hidden lg:inline">24/7 CUSTOMER SUPPORT</span>
        </div>
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between" aria-label="Main navigation">
          <Link to="/" className="flex flex-col leading-none" aria-label="YANOVA Home">
            <span className="font-black text-2xl tracking-tight text-black">
              YAN<span className="text-gold-500">OVA</span>
            </span>
            <span className="text-[10px] text-gray-400 tracking-wide mt-0.5 hidden sm:block">
              Smart Technology. Better Living.
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-9 text-sm font-semibold text-gray-800">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative pb-1 transition-colors ${
                  location.pathname === link.path ? 'text-black' : 'hover:text-gold-500'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gold-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-5 text-black">
            <button aria-label="Search" className="hidden sm:block hover:text-gold-500 transition-colors">
              <FiSearch className="w-5 h-5" />
            </button>
            <Link to="/admin/login" aria-label="Admin login" className="hover:text-gold-500 transition-colors">
              <FiUser className="w-5 h-5" />
            </Link>
            <button aria-label="Cart" className="relative hover:text-gold-500 transition-colors">
              <FiShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </button>
            <button
              className="md:hidden p-1 text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-gray-100 bg-white">
            <div className="py-4 space-y-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === link.path
                      ? 'bg-gold-500/10 text-gold-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
