import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import ImageField from './ImageField';
import ErrorNotice, { errorMessage } from './ErrorNotice';
const Editor = ({ title, fields, item, onSave, onClose, saving, error }) => {
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(field => {
    let value = item?.[field.key] ?? field.default ?? (field.type === 'checkbox' ? false : '');
    if (field.type === 'datetime-local' && value) { const date = new Date(value); value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16); }
    return [field.key, value];
  })));
  const [uploading, setUploading] = useState(false); const ref = useRef(null); const id = useId();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.querySelector('input,textarea,select,button')?.focus();
    return () => previous?.focus();
  }, []);
  const keydown = event => {
    if (event.key === 'Escape' && !saving && !uploading) onClose();
    if (event.key !== 'Tab') return;
    const nodes = [...ref.current.querySelectorAll('input:not([disabled]),textarea,select,button:not([disabled])')];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const submit = event => {
    event.preventDefault(); if (uploading) return;
    const payload = Object.fromEntries(fields.map(field => {
      let value = form[field.key];
      if (field.type === 'number') value = value === '' || value === null ? (field.nullable ? null : 0) : Number(value);
      if (field.type === 'list') value = Array.isArray(value) ? value : String(value).split(field.separator || ',').map(s => s.trim()).filter(Boolean);
      if (field.type === 'datetime-local') value = value ? new Date(value).toISOString() : null;
      return [field.key, value];
    }));
    onSave(payload);
  };
  return <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto p-4 sm:p-8" onKeyDown={keydown}><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${id}-heading`} className="glass-strong mx-auto max-w-2xl p-5 sm:p-8"><div className="flex items-center justify-between mb-6"><h2 id={`${id}-heading`} className="text-2xl font-bold">{title}</h2><button aria-label="Close editor" disabled={saving || uploading} onClick={onClose}><FiX className="w-6 h-6" /></button></div><form onSubmit={submit} className="space-y-5"><ErrorNotice message={error} />{fields.map(field => {
    const change = value => setForm(previous => ({ ...previous, [field.key]: value }));
    const value = form[field.key]; const inputId = `${id}-${field.key}`;
    if (field.type === 'image') return <ImageField key={field.key} label={field.label} value={value} required={field.required} recommendation={typeof field.imageSize === 'function' ? field.imageSize(form) : field.imageSize} onChange={change} onUploading={setUploading} />;
    if (field.type === 'checkbox') return <label className="flex gap-3 items-center" key={field.key}><input type="checkbox" checked={!!value} onChange={event => change(event.target.checked)} />{field.label}</label>;
    const props = { id: inputId, required: field.required, value: value ?? '', onChange: event => change(event.target.value), className: 'input-field' };
    return <div key={field.key}><label htmlFor={inputId} className="block text-sm text-dark-300 mb-2">{field.label}</label>{field.options ? <select {...props}>{field.options.map(option => <option key={option} value={option}>{option}</option>)}</select> : field.type === 'textarea' || field.type === 'list' ? <textarea {...props} value={Array.isArray(value) ? value.join(field.separator || ', ') : value || ''} rows={field.type === 'textarea' ? 4 : 2} /> : <input {...props} type={field.type || 'text'} min={field.min} max={field.max} step={field.step} value={field.type === 'datetime-local' && value ? value.slice(0,16) : value ?? ''} />}{field.help && <p className="text-dark-400 text-xs mt-1">{field.help}</p>}</div>;
  })}<div className="flex gap-3 pt-4"><button disabled={saving || uploading} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button><button type="button" disabled={saving || uploading} onClick={onClose} className="btn-secondary">Cancel</button></div></form></div></div>;
};
const ManagementPage = ({ title, singular, service, fields, columns, statuses = ['draft','published'] }) => {
  const [items, setItems] = useState([]); const [pagination, setPagination] = useState({ pages: 0, total: 0 });
  const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false); const [saveError, setSaveError] = useState(''); const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload(value => value + 1), []);
  useEffect(() => {
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try { const { data } = await service.getAll({ page, limit: 20, search, status }, { signal: abort.signal }); setItems(data.items); setPagination(data.pagination); if (data.pagination.pages && page > data.pagination.pages) setPage(data.pagination.pages); }
      catch (err) { if (!abort.signal.aborted) setError(errorMessage(err)); }
      finally { if (!abort.signal.aborted) setLoading(false); }
    }, search ? 250 : 0);
    return () => { clearTimeout(timer); abort.abort(); };
  }, [page, search, status, reload, service]);
  const save = async payload => {
    setSaving(true); setSaveError('');
    try { if (editor.item) await service.update(editor.item._id, payload); else await service.create(payload); setEditor(null); refresh(); }
    catch (err) { setSaveError(errorMessage(err)); }
    finally { setSaving(false); }
  };
  const remove = async item => {
    if (!window.confirm(`Delete ${item.name || item.title}?`)) return;
    try { await service.delete(item._id); refresh(); } catch (err) { setError(errorMessage(err)); }
  };
  return <div className="space-y-6"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Management</p><h1 className="text-3xl font-black">{title}</h1></div><button onClick={() => { setSaveError(''); setEditor({ item: null }); }} className="btn-primary inline-flex gap-2 items-center"><FiPlus />Add {singular}</button></div><div className="flex flex-wrap gap-3"><input aria-label={`Search ${title.toLowerCase()}`} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="input-field flex-1 min-w-[180px]" placeholder={`Search ${title.toLowerCase()}…`} />{statuses.length > 0 && <select aria-label="Filter by status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="input-field w-auto"><option value="">All statuses</option>{statuses.map(value => <option key={value}>{value}</option>)}</select>}</div><ErrorNotice message={error} onRetry={refresh} /><p className="text-dark-400 text-sm">{pagination.total} records</p><div className="glass-strong overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-dark-400">{columns.map(column => <th key={column.key} className="p-4">{column.label}</th>)}<th className="p-4">Actions</th></tr></thead><tbody>{items.map(item => <tr key={item._id} className="border-t border-dark-800">{columns.map(column => <td key={column.key} className="p-4">{column.render ? column.render(item) : String(item[column.key] ?? '—')}</td>)}<td className="p-4"><div className="flex gap-3"><button aria-label={`Edit ${item.name || item.title}`} onClick={() => { setSaveError(''); setEditor({ item }); }} className="text-gold-400"><FiEdit2 /></button><button aria-label={`Delete ${item.name || item.title}`} onClick={() => remove(item)} className="text-red-400"><FiTrash2 /></button></div></td></tr>)}</tbody></table>{loading && <p role="status" className="p-6 text-dark-400">Loading…</p>}{!loading && !items.length && <p className="p-6 text-dark-400">No records found.</p>}</div><div className="flex items-center gap-4"><button className="btn-secondary disabled:opacity-40" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span className="text-sm">Page {page} of {Math.max(1,pagination.pages)}</span><button className="btn-secondary disabled:opacity-40" disabled={page >= pagination.pages || loading} onClick={() => setPage(value => value + 1)}>Next</button></div>{editor && <Editor key={editor.item?._id || 'new'} title={`${editor.item ? 'Edit' : 'Add'} ${singular}`} fields={fields} item={editor.item} onSave={save} onClose={() => setEditor(null)} saving={saving} error={saveError} />}</div>;
};
export default ManagementPage;
