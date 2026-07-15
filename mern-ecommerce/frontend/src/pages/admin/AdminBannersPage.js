import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bannerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PageSkeleton } from '../../components/Loading';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiImage } from 'react-icons/fi';

const emptyBanner = { title: '', imageUrl: '', linkUrl: '', position: 'hero', active: true, order: 0 };

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyBanner);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await bannerAPI.getAll();
      setBanners(data);
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setForm(emptyBanner); setEditingId(null); setShowModal(true); };
  const openEdit = (banner) => { setForm(banner); setEditingId(banner._id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editingId) {
        await bannerAPI.update(editingId, payload);
        toast.success('Banner updated');
      } else {
        await bannerAPI.create(payload);
        toast.success('Banner created');
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    try {
      await bannerAPI.delete(id);
      toast.success('Banner deleted');
      setShowDeleteModal(null);
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const toggleActive = async (banner) => {
    try {
      await bannerAPI.update(banner._id, { ...banner, active: !banner.active });
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update banner');
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Banners</h1>
            <p className="text-white/60">Manage homepage and promotional banners</p>
          </div>
          <button onClick={openCreate} className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-5 py-3 rounded-xl flex items-center gap-2">
            <FiPlus className="w-5 h-5" /> Add Banner
          </button>
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-16 bg-dark-900 border border-white/10 rounded-2xl">
            <FiImage className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No banners yet</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div key={banner._id} className="bg-dark-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="aspect-video bg-white/5 relative">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full ${banner.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white mb-1 line-clamp-1">{banner.title}</h3>
                  <p className="text-white/50 text-sm mb-4 capitalize">{banner.position} position</p>
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(banner)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-2 rounded-xl text-sm">
                      {banner.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => openEdit(banner)} className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-2 rounded-xl"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => setShowDeleteModal(banner._id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl"><FiTrash2 className="w-4 h-4" /></button>
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
                <h2 className="text-2xl font-black text-white">{editingId ? 'Edit Banner' : 'Add Banner'}</h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"><FiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <input required placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <input placeholder="Link URL (optional)" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-500">
                    <option value="hero" className="bg-dark-900">Hero</option>
                    <option value="top" className="bg-dark-900">Top</option>
                    <option value="middle" className="bg-dark-900">Middle</option>
                    <option value="footer" className="bg-dark-900">Footer</option>
                  </select>
                  <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                </div>
                <label className="flex items-center gap-2 text-white/70 text-sm">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Active
                </label>
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
              <h3 className="text-xl font-bold text-white mb-4">Delete Banner</h3>
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

export default AdminBannersPage;
