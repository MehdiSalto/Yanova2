import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../services/api';
import Loading from '../components/Loading';
import { SearchBar, CategoryFilter, StatusFilter, ClearFilters } from '../components/FilterComponents';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';

const CATEGORIES = ['rings', 'necklaces', 'bracelets', 'earrings', 'watches', 'pendants'];
const STATUSES = ['active', 'inactive', 'draft'];

const ProductForm = ({ product, onSave, onCancel }) => {
  const [form, setForm] = useState(
    product || {
      name: '',
      description: '',
      price: '',
      category: 'rings',
      stock: '',
      status: 'active',
      images: [],
      colors: [],
      sizes: [],
    }
  );
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm({ ...form, images: [...form.images, imageUrl.trim()] });
      setImageUrl('');
    }
  };

  const addColor = () => {
    if (color.trim()) {
      setForm({ ...form, colors: [...form.colors, color.trim()] });
      setColor('');
    }
  };

  const addSize = () => {
    if (size.trim()) {
      setForm({ ...form, sizes: [...form.sizes, size.trim()] });
      setSize('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div className="glass-strong p-8 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-dark-800 rounded">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-2">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-2">Price ($)</label>
              <input
                required
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-2">Stock</label>
              <input
                required
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-2">Images (URLs)</label>
            <div className="flex gap-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-field"
                placeholder="https://..."
              />
              <button type="button" onClick={addImage} className="btn-secondary">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-16 h-16 rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-2">Colors</label>
              <div className="flex gap-2">
                <input value={color} onChange={(e) => setColor(e.target.value)} className="input-field" />
                <button type="button" onClick={addColor} className="btn-secondary">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.colors.map((c, i) => (
                  <span key={i} className="bg-dark-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                    {c}
                    <button type="button" onClick={() => setForm({ ...form, colors: form.colors.filter((_, idx) => idx !== i) })}>
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-2">Sizes</label>
              <div className="flex gap-2">
                <input value={size} onChange={(e) => setSize(e.target.value)} className="input-field" />
                <button type="button" onClick={addSize} className="btn-secondary">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.sizes.map((s, i) => (
                  <span key={i} className="bg-dark-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => setForm({ ...form, sizes: form.sizes.filter((_, idx) => idx !== i) })}>
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
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

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, formData);
      } else {
        await productsAPI.create(formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.delete(id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || p.category === category;
    const matchesStatus = !status || p.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="text-3xl font-black">Products</h1>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
        <CategoryFilter value={category} onChange={setCategory} categories={CATEGORIES} />
        <StatusFilter value={status} onChange={setStatus} options={STATUSES} />
        {(search || category || status) && (
          <ClearFilters
            onClick={() => {
              setSearch('');
              setCategory('');
              setStatus('');
            }}
          />
        )}
      </div>

      <div className="glass-strong overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-800/50">
            <tr className="text-left text-dark-300 text-sm">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-t border-dark-800 hover:bg-dark-800/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                    )}
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-dark-300 capitalize">{p.category}</td>
                <td className="p-4 text-gold-400 font-semibold">${p.price}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded capitalize ${
                      p.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : p.status === 'inactive'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-dark-700 text-dark-300'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-dark-700 rounded text-dark-300 hover:text-gold-400"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-2 hover:bg-dark-700 rounded text-dark-300 hover:text-red-400"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-dark-400 py-8">No products found.</p>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editingProduct}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductsPage;
