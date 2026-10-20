import { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { path: '/', label: 'HOME' },
  { path: '/products', label: 'SHOP' },
  { path: '/offers', label: 'OFFERS' },
  { path: '/about', label: 'ABOUT US' },
  { path: '/contact', label: 'CONTACT' },
  { path: '/advertise', label: 'ADVERTISE' },
];

const Navbar = () => {
  const location = useLocation();
  const { settings } = useSite();
  const siteName = settings?.siteInfo?.siteName || 'YANOBEN';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="bg-black text-white text-xs text-center px-4 py-2">EXPLORE THE COLLECTION · DISCOVER THE LATEST OFFERS</div>

      <header className="bg-surface border-b border-line sticky top-0 z-40">
        <nav className="store-nav max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between" aria-label="Main navigation">
          <Link to="/" className="flex flex-col leading-none" aria-label="YANOBEN Home">
            <span className="font-black text-2xl tracking-tight text-ink">
              {siteName}
            </span>
            <span className="text-[10px] text-gray-400 tracking-wide mt-0.5 hidden sm:block">
              {settings?.siteInfo?.tagline || 'Smart Technology. Better Living.'}
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-ink">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative pb-1 transition-colors ${
                  location.pathname === link.path ? 'text-ink' : 'hover:text-gold-500'
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gold-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-5 text-ink">
            <Link to="/products" aria-label="Search products" className="nav-search hover:text-gold-500 transition-colors">
              <FiSearch className="w-5 h-5" />
              <span className="hidden lg:inline text-sm font-semibold">Search</span>
            </Link>
            <ThemeToggle />
            <button
              className="lg:hidden p-1 text-ink"
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
          <div id="mobile-menu" className="lg:hidden border-t border-line bg-surface">
            <div className="py-4 space-y-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === link.path
                      ? 'bg-gold-500/10 text-gold-600'
                      : 'text-ink hover:bg-surface-muted'
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

