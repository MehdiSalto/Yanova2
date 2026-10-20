import SearchField from '../components/SearchField';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { productAPI } from '../services/api';
import { useSite } from '../context/SiteContext';
import ProductCard from '../components/ProductCard';
import { PageSkeleton } from '../components/Loading';
const ProductsPage=()=>{
  const [items,setItems]=useState([]);const [search,setSearch]=useState('');const [page,setPage]=useState(1);const [pagination,setPagination]=useState({pages:0,total:0});const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [retry,setRetry]=useState(0);
  const {settings}=useSite();
  useEffect(()=>{const abort=new AbortController();const timer=setTimeout(async()=>{
    setLoading(true);setError('');try{const {data}=await productAPI.getAll({page,limit:12,search},{signal:abort.signal});setItems(data.items);setPagination(data.pagination);}catch(err){if(!abort.signal.aborted)setError('Unable to load products. Please try again.');}finally{if(!abort.signal.aborted)setLoading(false);}
  },search?250:0);return()=>{clearTimeout(timer);abort.abort();};},[page,search,retry]);
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><Helmet><title>Products | {settings?.siteInfo?.siteName||'YANOBEN'}</title><meta name="description" content="Browse products and follow the purchase link for details and ordering."/></Helmet><p className="eyebrow">Shop the collection</p><h1 className="text-4xl font-black mb-6">All products</h1><SearchField value={search} onChange={value=>{setSearch(value);setPage(1);}} className="mb-6"/>{error&&<div role="alert" className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg">{error}<button onClick={()=>setRetry(value=>value+1)} className="ml-3 underline">Retry</button></div>}{loading?<PageSkeleton/>:<><p className="text-muted mb-5">{pagination.total} products</p><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{items.map(product=><ProductCard key={product._id} product={product}/>)}</div>{!items.length&&<p className="text-muted py-12">No products found.</p>}<div className="flex justify-center gap-5 items-center mt-10"><button className="btn-secondary disabled:opacity-40" disabled={page<=1} onClick={()=>setPage(value=>value-1)}>Previous</button><span>Page {page} of {Math.max(1,pagination.pages)}</span><button className="btn-secondary disabled:opacity-40" disabled={page>=pagination.pages} onClick={()=>setPage(value=>value+1)}>Next</button></div></>}</div>;
};
export default ProductsPage;
