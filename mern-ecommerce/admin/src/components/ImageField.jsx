import { useId, useState } from 'react';
import { mediaUrl, uploadAPI } from '../services/api';
import ErrorNotice, { errorMessage } from './ErrorNotice';
const ImageField = ({ value, onChange, required, label = 'Image', onUploading }) => {
  const id = useId(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const upload = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Choose an image smaller than 5 MiB.'); event.target.value = ''; return; }
    setBusy(true); onUploading?.(true); setError('');
    try { const { data } = await uploadAPI.upload(file); onChange(data.url); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); onUploading?.(false); event.target.value = ''; }
  };
  return <div className="space-y-3"><label htmlFor={id} className="block text-sm text-dark-300">{label}</label><input id={id} required={required} value={value || ''} onChange={event => onChange(event.target.value)} className="input-field" placeholder="https://… or upload an image" /><label className="block text-sm"><span>{busy ? 'Uploading…' : 'Upload image (up to 5 MiB)'}</span><input aria-label={`Upload ${label}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={upload} className="block mt-2 w-full text-sm" /></label>{value && <img src={mediaUrl(value)} alt="Selected upload" className="h-28 w-28 object-cover rounded-lg" />}<ErrorNotice message={error} /></div>;
};
export default ImageField;
