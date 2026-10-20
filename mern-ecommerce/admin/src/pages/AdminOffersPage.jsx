import ManagementPage from '../components/ManagementPage';
import { offersAPI } from '../services/api';
const fields = [
  { key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'imageUrl', label: 'Offer image', type: 'image', required: true, imageSize: { width: 1600, height: 900, ratio: '16:9 landscape', help: 'Used in the wide image area of offer cards. Keep text away from the edges.' } },
  { key: 'offerLink', label: 'External offer link', type: 'url', required: true },
  { key: 'discountPercentage', label: 'Discount (%)', type: 'number', min: 0, max: 100, required: true },
  { key: 'ctaText', label: 'Button text', default: 'Shop Now', required: true },
  { key: 'code', label: 'Promotion code (optional)', help: 'Displayed for use at the external merchant; it is not a local checkout coupon.' },
  { key: 'startsAt', label: 'Starts at (optional)', type: 'datetime-local' }, { key: 'expiresAt', label: 'Expires at (optional)', type: 'datetime-local' },
  { key: 'status', label: 'Status', options: ['draft','published'], default: 'draft' },
];
const columns = [{ key: 'title', label: 'Offer' }, { key: 'discountPercentage', label: 'Discount', render: item => `${item.discountPercentage}%` }, { key: 'code', label: 'Code' }, { key: 'status', label: 'Status' }, { key: 'expiresAt', label: 'Expires', render: item => item.expiresAt ? new Date(item.expiresAt).toLocaleString() : 'No expiry' }];
const AdminOffersPage = () => <ManagementPage title="Offers" singular="Offer" service={offersAPI} fields={fields} columns={columns} />;
export default AdminOffersPage;
