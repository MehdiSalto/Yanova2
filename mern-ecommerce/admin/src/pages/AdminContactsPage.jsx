import { useCallback, useEffect, useState } from 'react';
import { contactsAPI } from '../services/api';
import ErrorNotice, { errorMessage } from '../components/ErrorNotice';
const AdminContactsPage = () => {
  const [items,setItems] = useState([]); const [search,setSearch] = useState(''); const [status,setStatus] = useState('');
  const [page,setPage] = useState(1); const [pages,setPages] = useState(0); const [loading,setLoading] = useState(true);
  const [error,setError] = useState(''); const [reload,setReload] = useState(0); const [busy,setBusy] = useState('');
  const refresh = useCallback(() => setReload(value=>value+1), []);
  useEffect(() => {
    const abort = new AbortController(); const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try { const { data } = await contactsAPI.getAll({page,limit:20,search,status}, {signal:abort.signal}); setItems(data.items);setPages(data.pagination.pages); if (data.pagination.pages && page > data.pagination.pages) setPage(data.pagination.pages); }
      catch(err) { if (!abort.signal.aborted) setError(errorMessage(err)); }
      finally { if(!abort.signal.aborted) setLoading(false); }
    }, search ? 250 : 0);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [page,search,status,reload]);
  const update = async (item,value) => {
    setBusy(item._id); setError('');
    try { await contactsAPI.update(item._id,{status:value});refresh(); } catch(err) {setError(errorMessage(err));} finally {setBusy('');}
  };
  const remove = async item => {
    if(!window.confirm('Delete this message?'))return;
    setBusy(item._id);setError('');
    try {await contactsAPI.delete(item._id);refresh();}catch(err){setError(errorMessage(err));}finally{setBusy('');}
  };
  return <div className="space-y-6"><div><p className="eyebrow">Inbox</p><h1 className="text-3xl font-black">Contacts</h1></div><div className="flex flex-wrap gap-3"><input aria-label="Search messages" value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}} className="input-field flex-1" placeholder="Search name, email, subject or message…"/><select aria-label="Message status" value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}} className="input-field w-auto"><option value="">All statuses</option>{['new','read','replied'].map(value=><option key={value}>{value}</option>)}</select></div><ErrorNotice message={error} onRetry={refresh}/>{loading && <p role="status" className="text-dark-400">Loading…</p>}{items.map(item=><article key={item._id} className="glass-strong p-5 sm:p-6"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-bold text-lg">{item.fullName}</h2><p className="text-sm text-dark-400 break-all">{item.email}</p><h3 className="font-semibold mt-3">{item.subject}</h3></div><div className="flex items-start gap-3"><select aria-label={`Status for ${item.fullName}`} disabled={busy===item._id} value={item.status || (item.isRead?'read':'new')} onChange={event=>update(item,event.target.value)} className="input-field w-auto"><option value="new">New</option><option value="read">Read</option><option value="replied">Replied (manual)</option></select><button disabled={busy===item._id} onClick={()=>remove(item)} className="btn-secondary text-red-400">Delete</button></div></div><p className="whitespace-pre-wrap break-words mt-4 text-dark-200">{item.message}</p><p className="text-xs text-dark-400 mt-4">{new Date(item.createdAt).toLocaleString()}</p></article>)}{!loading && !items.length && <p className="text-dark-400 py-8">No messages found.</p>}<div className="flex gap-4 items-center"><button disabled={page<=1 || loading} onClick={()=>setPage(value=>value-1)} className="btn-secondary disabled:opacity-40">Previous</button><span className="text-sm">Page {page} of {Math.max(1,pages)}</span><button disabled={page>=pages || loading} onClick={()=>setPage(value=>value+1)} className="btn-secondary disabled:opacity-40">Next</button></div><p className="text-xs text-dark-400">Replied is a manual label. This page does not send emails.</p></div>;
};
export default AdminContactsPage;
