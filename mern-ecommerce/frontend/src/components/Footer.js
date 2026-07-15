import { Link } from 'react-router-dom';
import {
  FiFacebook, FiInstagram, FiYoutube, FiMail, FiShield,
} from 'react-icons/fi';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      {/* Newsletter */}
      <div className="bg-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <FiMail className="w-7 h-7 text-black flex-shrink-0" />
            <div>
              <p className="font-black text-sm text-black">STAY UPDATED</p>
              <p className="text-black/70 text-xs">Get exclusive deals, new product alerts, and more.</p>
            </div>
          </div>
          <form
            className="flex w-full sm:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-64 px-4 py-3 rounded-l-md border-none text-sm text-black placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-black text-white text-sm font-bold px-6 py-3 rounded-r-md hover:bg-gray-900 transition-colors whitespace-nowrap"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <span className="font-black text-xl tracking-tight">
            YAN<span className="text-gold-500">OVA</span>
          </span>
          <p className="text-gray-500 text-[11px] mt-0.5 mb-4">Smart Technology. Better Living.</p>
          <p className="text-gray-400 text-sm mb-5 max-w-xs">
            Innovative high-tech products designed to improve your lifestyle.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold-500 hover:text-gold-500 transition-colors">
              <FiFacebook className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold-500 hover:text-gold-500 transition-colors">
              <FiInstagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:border-gold-500 hover:text-gold-500 transition-colors">
              <FiYoutube className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 tracking-wide">SHOP</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><Link to="/products" className="hover:text-gold-500 transition-colors">All Products</Link></li>
            <li><Link to="/offers" className="hover:text-gold-500 transition-colors">Offers</Link></li>
            <li><Link to="/products" className="hover:text-gold-500 transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 tracking-wide">CUSTOMER SERVICE</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><Link to="/policies" className="hover:text-gold-500 transition-colors">Shipping Policy</Link></li>
            <li><Link to="/policies" className="hover:text-gold-500 transition-colors">Returns &amp; Refunds</Link></li>
            <li><Link to="/contact" className="hover:text-gold-500 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm mb-4 tracking-wide">COMPANY</h4>
          <ul className="space-y-2.5 text-sm text-gray-400 mb-6">
            <li><Link to="/about" className="hover:text-gold-500 transition-colors">About Us</Link></li>
            <li><Link to="/policies" className="hover:text-gold-500 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/policies" className="hover:text-gold-500 transition-colors">Terms of Service</Link></li>
          </ul>
          <h4 className="font-bold text-sm mb-3 tracking-wide">SECURE PAYMENTS</h4>
          <div className="flex items-center gap-2">
            <span className="border border-white/20 text-gray-400 text-[10px] px-2 py-1 rounded flex items-center gap-1">
              <FiShield className="w-3 h-3" /> SSL SECURE
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-gray-500 text-xs">
        © {year} YANOVA. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
