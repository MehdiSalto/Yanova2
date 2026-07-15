import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offerAPI } from '../services/api';
import { PageSkeleton } from '../components/Loading';
import { SearchInput, Select } from '../components/FilterComponents';
import { FiFilter, FiX } from 'react-icons/fi';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Offers' },
    { value: 'active', label: 'Active Only' },
    { value: 'high-discount', label: 'High Discount (50%+)' },
  ];

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data } = await offerAPI.getAll();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBy('all');
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === 'active') {
      const now = new Date();
      return matchesSearch && (!offer.expiresAt || new Date(offer.expiresAt) > now);
    }
    if (filterBy === 'high-discount') {
      return matchesSearch && offer.discountPercentage >= 50;
    }
    return matchesSearch;
  });

  if (loading) return <PageSkeleton />;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="eyebrow">LIMITED TIME</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">Special Offers</h1>
          <p className="text-gray-500 max-w-2xl">
            Discover amazing deals and discounts on premium products. Limited time offers you won't want to miss.
          </p>
        </motion.div>

        <div className="mb-8 glass-strong p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search offers..." />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  showFilters ? 'bg-gold-500/10 text-gold-600 border border-gold-500/30' : 'bg-white text-gray-600 hover:text-black border border-gray-200'
                }`}
              >
                <FiFilter className="w-5 h-5" />
                Filters
              </button>
              {(searchTerm || filterBy !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-100"
              >
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Filter By</label>
                  <Select options={filterOptions} value={filterBy} onChange={setFilterBy} placeholder="Select filter..." />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-gray-500 mb-4">
          {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''} found
        </p>

        {filteredOffers.length === 0 ? (
          <div className="text-center py-16 glass-strong">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <FiFilter className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">No offers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer._id}
                className="group glass card-hover overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
              >
                <div className="relative aspect-video overflow-hidden bg-gray-50">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                      -{offer.discountPercentage}%
                    </span>
                  </div>
                  {offer.discountPercentage >= 50 && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">MEGA DEAL</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{offer.description}</p>
                  <div className="text-sm text-gray-400 mb-4">
                    Valid until: {offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString() : 'No expiry'}
                  </div>
                  <a href={offer.offerLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full flex justify-center">
                    {offer.ctaText || 'Shop Now'}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;
