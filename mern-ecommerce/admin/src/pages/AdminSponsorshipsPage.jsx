import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FiExternalLink, FiMail, FiRefreshCw, FiX } from 'react-icons/fi';
import { sponsorshipsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import ErrorNotice, { errorMessage } from '../components/ErrorNotice';
const statuses = [['new', 'New'], ['reviewing', 'Reviewing'], ['replied', 'Replied (manual)'], ['approved', 'Approved'], ['declined', 'Declined'], ['archived', 'Archived']];
function RequestDetails({ item, groups, onClose, onSaved }) {
  const [status, setStatus] = useState(item.status); const [notes, setNotes] = useState(item.internalNotes || '');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const ref = useRef(null); const id = useId();
  useEffect(() => { const previous = document.activeElement; ref.current?.querySelector('button')?.focus(); return () => previous?.focus(); }, []);
  const keydown = event => {
    if (event.key === 'Escape' && !busy) onClose();
    if (event.key !== 'Tab') return;
    const focusable = [...ref.current.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled])')];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const save = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { await sponsorshipsAPI.update(item._id, { status, internalNotes: notes }); onSaved(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto p-3 sm:p-8" onKeyDown={keydown}><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-heading`} className="glass-strong max-w-3xl mx-auto p-5 sm:p-8 space-y-7"><div className="flex justify-between items-start gap-4"><div><p className="eyebrow">Sponsorship enquiry</p><h2 id={`${id}-heading`} className="text-2xl font-black break-words">{item.companyName || item.fullName}</h2><p className="text-dark-400 text-sm mt-2">Received {new Date(item.createdAt).toLocaleString()}</p></div><button type="button" disabled={busy} aria-label="Close sponsorship details" className="p-2 shrink-0" onClick={onClose}><FiX className="w-5 h-5" /></button></div><div className="rounded-xl border border-dark-700 p-4 text-sm"><p className="font-semibold">{item.fullName}</p><a className="inline-flex items-center gap-2 mt-2 underline underline-offset-4 break-all" href={`mailto:${item.email}`}><FiMail className="shrink-0" />{item.email}</a><p className="text-dark-400 mt-3">Use the supplied contact details to reply, then record your progress and notes below.</p></div>{groups.map(group => <section key={group.title}><h3 className="text-lg font-bold border-b border-dark-800 pb-3 mb-4">{group.title}</h3><dl className="space-y-4">{group.fields.map(field => <div key={field.key}><dt className="text-sm font-semibold">{field.label}</dt><dd className="text-sm text-dark-300 mt-1 whitespace-pre-wrap break-words">{item[field.key] ? field.type === 'url' && /^https?:\/\//i.test(item[field.key]) ? <a href={item[field.key]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 inline-flex items-center gap-2 break-all">{item[field.key]}<FiExternalLink className="shrink-0" /></a> : item[field.key] : <span className="text-dark-400">Not provided</span>}</dd></div>)}</dl></section>)}<p className="text-xs text-dark-400">Permission to contact: {item.contactConsent ? 'Confirmed with this request' : 'Not confirmed'}</p><form onSubmit={save} className="border-t border-dark-800 pt-6 space-y-5"><ErrorNotice message={error} /><div><label htmlFor={`${id}-status`} className="block text-sm font-semibold mb-2">Request status</label><select id={`${id}-status`} className="input-field" value={status} disabled={busy} onChange={event => setStatus(event.target.value)}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label htmlFor={`${id}-notes`} className="block text-sm font-semibold mb-2">Internal notes</label><textarea id={`${id}-notes`} className="input-field" rows={5} maxLength={5000} disabled={busy} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Record pricing discussions, next steps or follow-up details for your team." /><p className="text-xs text-dark-400 mt-2">Visible only to administrators.</p></div><div className="flex flex-wrap gap-3"><button disabled={busy} className="btn-primary disabled:opacity-50">{busy ? 'Saving…' : 'Save changes'}</button><button type="button" disabled={busy} onClick={onClose} className="btn-secondary">Close</button></div></form></div></div>;
}
export default function AdminSponsorshipsPage() {
  const [items, setItems] = useState([]); const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 0, total: 0 }); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); const [retry, setRetry] = useState(0); const [selected, setSelected] = useState(null); const [deleting, setDeleting] = useState('');
  const { revision } = useSocket(); const refresh = useCallback(() => setRetry(value => value + 1), []);
  useEffect(() => {
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const [list, schema] = await Promise.all([sponsorshipsAPI.getAll({ page, limit: 20, search, status }, { signal: abort.signal }), sponsorshipsAPI.getForm({ signal: abort.signal })]);
        setItems(list.data.items); setPagination(list.data.pagination); setGroups(schema.data.groups);
        if (list.data.pagination.pages && page > list.data.pagination.pages) setPage(list.data.pagination.pages);
      } catch (err) { if (!abort.signal.aborted) setError(errorMessage(err)); }
      finally { if (!abort.signal.aborted) setLoading(false); }
    }, search ? 250 : 0);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [page, search, status, retry, revision]);
  const remove = async item => {
    if (!window.confirm(`Delete the sponsorship request from ${item.fullName}?`)) return;
    setDeleting(item._id); setError('');
    try { await sponsorshipsAPI.delete(item._id); refresh(); } catch (err) { setError(errorMessage(err)); } finally { setDeleting(''); }
  };
  return <div className="space-y-6"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Advertising enquiries</p><h1 className="text-3xl font-black">Sponsorships</h1><p className="text-sm text-dark-400 mt-2">Review campaign details, answer advertisers and keep track of each request.</p></div><button type="button" className="theme-toggle shrink-0" aria-label="Refresh sponsorship requests" onClick={refresh}><FiRefreshCw className={loading ? 'animate-spin' : ''} /></button></div><div className="flex flex-wrap gap-3"><input aria-label="Search sponsorship requests" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="input-field flex-1 min-w-[180px]" placeholder="Search name, company, email or campaign…" /><select aria-label="Sponsorship request status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="input-field w-auto"><option value="">All statuses</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><ErrorNotice message={error} onRetry={refresh} /><p className="text-sm text-dark-400">{pagination.total} sponsorship requests</p><div className="glass-strong overflow-x-auto"><table className="analytics-table"><thead><tr><th>Advertiser</th><th>Campaign</th><th>Status</th><th>Received</th><th>Actions</th></tr></thead><tbody>{items.map(item => <tr key={item._id}><td className="min-w-40"><p className="font-semibold">{item.fullName}</p>{item.companyName && <p className="text-xs text-dark-400 mt-1">{item.companyName}</p>}<p className="text-xs text-dark-400 mt-1 break-all">{item.email}</p></td><td className="min-w-40 max-w-xs"><p className="line-clamp-2">{item.promotedItem}</p>{item.budget && <p className="text-xs text-dark-400 mt-2">Budget: {item.budget}</p>}</td><td><span className={`capitalize text-xs px-2.5 py-1.5 rounded-full inline-block ${item.status === 'new' ? 'bg-gold-500/20 font-semibold' : 'bg-dark-800 text-dark-300'}`}>{item.status}</span></td><td className="text-xs whitespace-nowrap text-dark-400">{new Date(item.createdAt).toLocaleDateString()}</td><td><div className="flex flex-wrap gap-3"><button type="button" className="underline underline-offset-4 font-semibold whitespace-nowrap" onClick={() => setSelected(item)}>View request<span className="sr-only"> from {item.fullName}</span></button><button type="button" disabled={deleting === item._id} onClick={() => remove(item)} className="text-red-500 text-xs disabled:opacity-40">Delete<span className="sr-only"> request from {item.fullName}</span></button></div></td></tr>)}</tbody></table>{loading && <p role="status" className="p-6 text-sm text-dark-400">Loading requests…</p>}{!loading && !items.length && <p className="p-6 text-sm text-dark-400">No sponsorship requests found.</p>}</div><div className="flex justify-between items-center gap-3 text-sm"><button className="btn-secondary disabled:opacity-40" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {Math.max(1, pagination.pages)}</span><button className="btn-secondary disabled:opacity-40" disabled={page >= pagination.pages || loading} onClick={() => setPage(value => value + 1)}>Next</button></div>{selected && <RequestDetails key={selected._id} item={selected} groups={groups} onClose={() => setSelected(null)} onSaved={() => { setSelected(null); refresh(); }} />}</div>;
}
