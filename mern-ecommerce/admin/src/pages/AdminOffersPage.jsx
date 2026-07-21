import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offersAPI } from '../services/api';
import Loading from '../components/Loading';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';

const OfferForm = ({ offer, onSave, onCancel }) => {
  const [form, setForm] = useState(
    offer || {
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      code: '',
      startDate: '',
      endDate: '',
      isActive: true,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      discountValue: Number(form.discountValue),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    >
      <div className="glass-strong p-8 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{offer ? 'Edit Offer' : 'Add Offer'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-dark-800 rounded">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-2">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-2">Discount Type</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input-field">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-2">Discount Value</label>
              <input required type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">Promo Code</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" placeholder="SUMMER25" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-2">Start Date</label>
              <input type="date" value={form.startDate?.slice(0, 10)} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-2">End Date</label>
              <input type="date" value={form.endDate?.slice(0, 10)} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm text-dark-300">Active</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <FiSave className="w-5 h-5" /> Save
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const fetchOffers = async () => {
    try {
      const { data } = await offersAPI.getAll();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingOffer) {
        await offersAPI.update(editingOffer._id, formData);
      } else {
        await offersAPI.create(formData);
      }
      setShowForm(false);
      setEditingOffer(null);
      fetchOffers();
    } catch (error) {
      console.error('Failed to save offer:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await offersAPI.delete(id);
      fetchOffers();
    } catch (error) {
      console.error('Failed to delete offer:', error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Promotions</p>
          <h1 className="text-3xl font-black">Offers</h1>
        </div>
        <button
          onClick={() => {
            setEditingOffer(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" /> Add Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <motion.div
            key={offer._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold">{offer.title}</h3>
                {offer.code && (
                  <span className="inline-block mt-1 text-xs bg-gold-500/20 text-gold-400 px-2 py-1 rounded font-mono">
                    {offer.code}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingOffer(offer);
                    setShowForm(true);
                  }}
                  className="p-2 hover:bg-dark-700 rounded text-dark-300 hover:text-gold-400"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(offer._id)} className="p-2 hover:bg-dark-700 rounded text-dark-300 hover:text-red-400">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-dark-400 text-sm mb-3">{offer.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-gold-400 font-bold">
                {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`} OFF
              </span>
              <span className={`text-xs px-2 py-1 rounded ${offer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-300'}`}>
                {offer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      {offers.length === 0 && <p className="text-center text-dark-400 py-8">No offers yet.</p>}

      <AnimatePresence>
        {showForm && (
          <OfferForm
            offer={editingOffer}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingOffer(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOffersPage;
