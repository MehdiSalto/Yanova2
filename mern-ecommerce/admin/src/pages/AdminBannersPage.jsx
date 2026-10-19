import ManagementPage from '../components/ManagementPage';
import { bannersAPI, mediaUrl } from '../services/api';
const fields = [
  { key: 'title', label: 'Title', required: true }, { key: 'imageUrl', label: 'Banner image', type: 'image', required: true },
  { key: 'linkUrl', label: 'Link (optional)', help: 'An internal /path or an http/https URL.' },
  { key: 'position', label: 'Position', options: ['hero','top','middle','footer'], default: 'hero' },
  { key: 'order', label: 'Order', type: 'number', min: 0, max: 9999, default: 0 }, { key: 'active', label: 'Active', type: 'checkbox', default: true },
];
const columns = [{ key: 'title', label: 'Banner', render: item => <div className="flex gap-3 items-center"><img src={mediaUrl(item.imageUrl)} alt="" className="w-16 h-10 object-cover rounded" />{item.title}</div> }, { key: 'position', label: 'Position' }, { key: 'order', label: 'Order' }, { key: 'active', label: 'Active', render: item => item.active ? 'Active' : 'Hidden' }];
const AdminBannersPage = () => <ManagementPage title="Banners" singular="Banner" service={bannersAPI} fields={fields} columns={columns} statuses={[]} />;
export default AdminBannersPage;
