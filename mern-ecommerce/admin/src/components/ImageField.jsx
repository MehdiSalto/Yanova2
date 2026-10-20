import { useId, useState } from 'react';
import { mediaUrl, uploadAPI } from '../services/api';
import ErrorNotice, { errorMessage } from './ErrorNotice';
const ImageField = ({ value, onChange, required, label = 'Image', onUploading, recommendation }) => {
  const id = useId(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [dimensions, setDimensions] = useState(null);
  const upload = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Choose an image smaller than 5 MiB.'); event.target.value = ''; return; }
    setBusy(true); onUploading?.(true); setError('');
    try { const { data } = await uploadAPI.upload(file); onChange(data.url); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); onUploading?.(false); event.target.value = ''; }
  };
  return <div className="space-y-3"><label htmlFor={id} className="block text-sm text-dark-300">{label}</label>{recommendation && <div id={`${id}-size`} className="rounded-xl border border-gold-500/30 bg-gold-500/10 p-3 text-sm"><p className="font-semibold">Recommended: {recommendation.width} × {recommendation.height} px · {recommendation.ratio}</p><p className="text-dark-300 mt-1">{recommendation.help} PNG, JPG or WebP · up to 5 MiB. Other sizes are accepted.</p></div>}<input id={id} aria-describedby={recommendation ? `${id}-size` : undefined} required={required} value={value || ''} onChange={event => { setDimensions(null); onChange(event.target.value); }} className="input-field" placeholder="https://… or upload an image" /><label className="block text-sm"><span>{busy ? 'Uploading…' : 'Upload image (up to 5 MiB)'}</span><input aria-label={`Upload ${label}`} aria-describedby={recommendation ? `${id}-size` : undefined} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={upload} className="block mt-2 w-full text-sm" /></label>{value && <div><img key={value} src={mediaUrl(value)} alt="Selected upload" className="max-h-48 max-w-full object-contain rounded-lg" onLoad={event => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setDimensions(null)} />{dimensions && <p className="text-xs text-dark-400 mt-2">Current image: {dimensions.width} × {dimensions.height} px{recommendation && Math.abs(dimensions.width / dimensions.height - recommendation.width / recommendation.height) > 0.08 ? ' · Different ratio; the store may crop this image. Keep important content centered.' : ''}</p>}</div>}<ErrorNotice message={error} /></div>;
};
export default ImageField;
