import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bannersAPI } from '../services/api';
import Loading from '../components/Loading';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';

const BannerForm = ({ banner, onSave, onCancel }) => {
  const [form, setForm] = useState(
    banner || {
      title: '',
      subtitle: '',
      image: '',
      link: '',
      isActive: true,
      order: 0,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, order: Number(form.order) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    >
      <div className="glass-strong p-8 w-full max-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{banner ? 'Edit Banner' : 'Add Banner'}</h2>
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
            <label className="block text-sm text-dark-300 mb-2">Subtitle</label>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">Image URL</label>
            <input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">Link</label>
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field" placeholder="/products" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-2">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="input-field" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm text-dark-300">Active</span>
              </label>
            </div>
          </div>

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

const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const fetchBanners = async () => {
    try {
      const { data } = await bannersAPI.getAll();
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingBanner) {
        await bannersAPI.update(editingBanner._id, formData);
      } else {
        await bannersAPI.create(formData);
      }
      setShowForm(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await bannersAPI.delete(id);
      fetchBanners();
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Homepage</p>
          <h1 className="text-3xl font-black">Banners</h1>
        </div>
        <button
          onClick={() => {
            setEditingBanner(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => (
          <motion.div
            key={banner._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong overflow-hidden"
          >
            <div className="relative h-40 bg-dark-800">
              {banner.image && (
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => {
                    setEditingBanner(banner);
                    setShowForm(true);
                  }}
                  className="p-2 bg-dark-900/80 hover:bg-dark-800 rounded text-white"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(banner._id)} className="p-2 bg-dark-900/80 hover:bg-red-500 rounded text-white">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{banner.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${banner.isActive ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-dark-300'}`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-dark-400 text-sm">{banner.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {banners.length === 0 && <p className="text-center text-dark-400 py-8">No banners yet.</p>}

      <AnimatePresence>
        {showForm && (
          <BannerForm
            banner={editingBanner}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingBanner(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBannersPage;
