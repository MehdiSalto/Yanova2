import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PageSkeleton } from '../../components/Loading';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiTag } from 'react-icons/fi';

const emptyOffer = { title: '', description: '', imageUrl: '', discountPercentage: '', offerLink: '', ctaText: 'Shop Now', expiresAt: '' };

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyOffer);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data } = await offerAPI.getAll();
      setOffers(data);
    } catch (error) {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setForm(emptyOffer); setEditingId(null); setShowModal(true); };
  const openEdit = (offer) => { setForm({ ...offer, expiresAt: offer.expiresAt ? offer.expiresAt.slice(0, 10) : '' }); setEditingId(offer._id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, discountPercentage: Number(form.discountPercentage) };
      if (editingId) {
        await offerAPI.update(editingId, payload);
        toast.success('Offer updated');
      } else {
        await offerAPI.create(payload);
        toast.success('Offer created');
      }
      setShowModal(false);
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save offer');
    }
  };

  const handleDelete = async (id) => {
    try {
      await offerAPI.delete(id);
      toast.success('Offer deleted');
      setShowDeleteModal(null);
      fetchOffers();
    } catch (error) {
      toast.error('Failed to delete offer');
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Offers</h1>
            <p className="text-white/60">Manage promotional offers</p>
          </div>
          <button onClick={openCreate} className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-5 py-3 rounded-xl flex items-center gap-2">
            <FiPlus className="w-5 h-5" /> Add Offer
          </button>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-16 bg-dark-900 border border-white/10 rounded-2xl">
            <FiTag className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No offers yet</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer._id} className="bg-dark-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="aspect-video bg-white/5"><img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" /></div>
                <div className="p-5">
                  <h3 className="font-bold text-white mb-1 line-clamp-1">{offer.title}</h3>
                  <p className="text-white/50 text-sm mb-4">-{offer.discountPercentage}% off</p>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(offer)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2"><FiEdit2 className="w-4 h-4" /> Edit</button>
                    <button onClick={() => setShowDeleteModal(offer._id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl flex items-center justify-center gap-2"><FiTrash2 className="w-4 h-4" /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">{editingId ? 'Edit Offer' : 'Add Offer'}</h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"><FiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500 resize-none" />
                <input required placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" placeholder="Discount %" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-500" />
                </div>
                <input required placeholder="Offer link" value={form.offerLink} onChange={(e) => setForm({ ...form, offerLink: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <input placeholder="CTA text (default: Shop Now)" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2"><FiSave className="w-5 h-5" /> Save</button>
                  <button type="button" onClick={() => setShowModal(false)} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-xl font-bold text-white mb-4">Delete Offer</h3>
              <p className="text-white/60 mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl">Cancel</button>
                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-xl">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOffersPage;
