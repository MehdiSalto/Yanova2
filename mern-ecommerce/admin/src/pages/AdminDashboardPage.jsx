import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, productsAPI, contactsAPI, mediaUrl } from '../services/api';
import { useSocket } from '../context/SocketContext';
import AnalyticsPanel from '../components/AnalyticsPanel';
import ErrorNotice, { errorMessage } from '../components/ErrorNotice';
const AdminDashboardPage = () => {
  const [stats,setStats]=useState(null); const [products,setProducts]=useState([]);const [contacts,setContacts]=useState([]);
  const [error,setError]=useState('');const [retry,setRetry]=useState(0);const {revision}=useSocket();
  useEffect(()=>{
    const abort=new AbortController();
    const fetchData=async()=>{
      try{
        const [s,p,c]=await Promise.all([dashboardAPI.getStats({signal:abort.signal}),productsAPI.getAll({limit:5},{signal:abort.signal}),contactsAPI.getAll({limit:5},{signal:abort.signal})]);
        setStats(s.data);setProducts(p.data.items);setContacts(c.data.items);setError('');
      }catch(err){if(!abort.signal.aborted)setError(errorMessage(err));}
    };fetchData();return()=>abort.abort();
  },[revision,retry]);
  const cards=[['Total products',stats?.totalProducts],['Draft products',stats?.draftProducts],['Active offers',stats?.activeOffers],['Unread messages',stats?.newContacts]];
  return <div className="space-y-8"><div className="flex justify-between gap-4"><div><p className="eyebrow">Overview</p><h1 className="text-3xl font-black">Dashboard</h1></div><Link to="/products" className="btn-primary">Products</Link></div><ErrorNotice message={error} onRetry={()=>setRetry(value=>value+1)}/>{!stats && !error && <p role="status">Loading dashboard…</p>}<div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{cards.map(([label,value])=><div key={label} className="glass-strong p-5"><p className="text-dark-400 text-sm">{label}</p><p className="text-3xl font-black mt-2">{value??'—'}</p></div>)}</div><AnalyticsPanel/><div className="grid lg:grid-cols-2 gap-6"><section className="glass-strong p-6"><h2 className="text-xl font-bold mb-4">Recent products</h2>{products.map(item=><div key={item._id} className="py-3 flex items-center justify-between gap-3"><div className="flex gap-3 items-center"><img src={mediaUrl(item.imageUrl)} alt="" className="w-10 h-10 rounded object-cover"/><div><p>{item.name}</p><p className="text-dark-400 text-xs">{item.status}</p></div></div><span className="text-gold-400">${Number(item.price).toFixed(2)}</span></div>)}{!products.length&&<p className="text-dark-400">No products yet.</p>}</section><section className="glass-strong p-6"><h2 className="text-xl font-bold mb-4">Recent messages</h2>{contacts.map(item=><div key={item._id} className="py-3 border-b border-dark-800"><div className="flex justify-between gap-3"><p className="font-semibold">{item.fullName}</p><span className="text-dark-400 text-xs">{item.status||(item.isRead?'read':'new')}</span></div><p className="text-dark-400 text-sm truncate">{item.subject}</p></div>)}{!contacts.length&&<p className="text-dark-400">No messages yet.</p>}</section></div></div>;
};
export default AdminDashboardPage;
