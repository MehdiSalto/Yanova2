import ManagementPage from '../components/ManagementPage';
import { productsAPI, mediaUrl } from '../services/api';
const fields = [
  { key: 'name', label: 'Name', required: true }, { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'price', label: 'Price ($)', type: 'number', min: 0, step: '0.01', required: true },
  { key: 'discount', label: 'Discount (%)', type: 'number', min: 0, max: 100, default: 0 },
  { key: 'imageUrl', label: 'Main image', type: 'image', required: true },
  { key: 'gallery', label: 'Gallery image URLs (one per line)', type: 'list', separator: '\n', default: [] },
  { key: 'buyLink', label: 'External buy link', type: 'url', required: true },
  { key: 'category', label: 'Category', default: 'general', required: true },
  { key: 'stock', label: 'Stock (optional)', type: 'number', nullable: true, min: 0, help: 'Informational stock; purchases happen at the external buy link.' },
  { key: 'colors', label: 'Colors (comma separated)', type: 'list', default: [] },
  { key: 'sizes', label: 'Sizes (comma separated)', type: 'list', default: [] },
  { key: 'status', label: 'Status', options: ['draft','published'], default: 'draft' },
  { key: 'featured', label: 'Featured product', type: 'checkbox' },
];
const columns = [
  { key: 'name', label: 'Product', render: item => <div className="flex items-center gap-3"><img src={mediaUrl(item.imageUrl)} alt="" className="w-10 h-10 rounded object-cover" /><span>{item.name}</span></div> },
  { key: 'category', label: 'Category' }, { key: 'price', label: 'Price', render: item => `$${Number(item.price).toFixed(2)}` },
  { key: 'stock', label: 'Stock' }, { key: 'status', label: 'Status' },
];
const AdminProductsPage = () => <ManagementPage title="Products" singular="Product" service={productsAPI} fields={fields} columns={columns} />;
export default AdminProductsPage;
