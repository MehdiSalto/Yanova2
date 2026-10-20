import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import AnalyticsPanel from '../components/AnalyticsPanel';
export default function AdminProductAnalyticsPage() {
  const { productId } = useParams();
  return <div className="space-y-6"><Link to="/products" className="inline-flex items-center gap-2 text-sm underline underline-offset-4"><FiArrowLeft />Back to products</Link><AnalyticsPanel key={productId} productId={productId} /></div>;
}
