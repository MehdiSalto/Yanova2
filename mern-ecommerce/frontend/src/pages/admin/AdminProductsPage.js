import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PageSkeleton } from '../../components/Loading';
import { SearchInput } from '../../components/FilterComponents';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiPackage } from 'react-icons/fi';

const emptyProduct = {
  name: '', description: '', price: '', discount: 0, imageUrl: '', buyLink: '', status: 'draft', featured: false,
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setForm({ ...product, price: product.price, discount: product.discount });
    setEditingId(product._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), discount: Number(form.discount) };
      if (editingId) {
        await productAPI.update(editingId, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      setShowDeleteModal(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Products</h1>
            <p className="text-white/60">Manage your product catalog</p>
          </div>
          <button onClick={openCreate} className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-colors">
            <FiPlus className="w-5 h-5" /> Add Product
          </button>
        </div>

        <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 mb-8">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search products..." />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-dark-900 border border-white/10 rounded-2xl">
            <FiPackage className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-white/60">Add your first product to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <div key={product._id} className="bg-dark-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="aspect-video bg-white/5">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white line-clamp-1">{product.name}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      product.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gold-500/20 text-gold-400'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-4">${product.price} {product.discount > 0 && `(-${product.discount}%)`}</p>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(product)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <FiEdit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => setShowDeleteModal(product._id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <FiTrash2 className="w-4 h-4" /> Delete
                    </button>
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
                <h2 className="text-2xl font-black text-white">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"><FiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500 resize-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                  <input type="number" placeholder="Discount %" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                </div>
                <input required placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <input required placeholder="Buy link" value={form.buyLink} onChange={(e) => setForm({ ...form, buyLink: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500" />
                <div className="flex items-center gap-6">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-500">
                    <option value="draft" className="bg-dark-900">Draft</option>
                    <option value="published" className="bg-dark-900">Published</option>
                  </select>
                  <label className="flex items-center gap-2 text-white/70 text-sm">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                    Featured
                  </label>
                </div>
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
              <h3 className="text-xl font-bold text-white mb-4">Delete Product</h3>
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

export default AdminProductsPage;
