import { useId } from 'react';
export const formatNumber = value => Number(value || 0).toLocaleString();
export const countryName = code => {
  if (!code || code === 'ZZ') return 'Unknown country';
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch { return code; }
};
export function Bars({ rows, label = 'Comparison', percentage = false }) {
  const maximum = Math.max(1, ...rows.map(row => row.value));
  if (!rows.length) return <p className="analytics-empty">No data recorded for this period.</p>;
  return <figure aria-label={label} className="space-y-4">{rows.map((row, index) => <div key={row.id || row.label}><div className="flex justify-between items-start gap-4 text-sm mb-2"><span className="break-words min-w-0">{row.label}</span><span className="font-semibold tabular-nums whitespace-nowrap">{formatNumber(row.value)}{percentage ? ` · ${row.percentage.toFixed(2)}%` : ''}</span></div><div className="h-3 rounded-full bg-dark-800 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${percentage ? row.percentage : row.value / maximum * 100}%`, background: index % 2 ? '#3b82f6' : '#ba8726' }} /></div></div>)}</figure>;
}
export function TrendChart({ rows, product = false }) {
  const id = useId();
  const fields = [{ key: product ? 'productViews' : 'pageViews', label: product ? 'Product views' : 'Page views', color: '#ba8726' }, { key: 'visitors', label: product ? 'Unique viewers per period' : 'Unique visitors per period', color: '#3b82f6' }, { key: 'outboundClicks', label: 'Outbound clicks', color: '#a855f7' }];
  if (!rows.length || !rows.some(row => fields.some(field => row[field.key] > 0))) return <p className="analytics-empty">No activity recorded for this period.</p>;
  const max = Math.max(1, ...rows.flatMap(row => fields.map(field => row[field.key])));
  const x = index => 44 + (rows.length === 1 ? 300 : index / (rows.length - 1) * 600);
  const y = value => 200 - value / max * 170;
  return <figure><svg role="img" aria-labelledby={`${id}-title ${id}-desc`} viewBox="0 0 680 245" className="w-full min-h-40"><title id={`${id}-title`}>Activity over time</title><desc id={`${id}-desc`}>{rows.length} time periods. {fields.map(field => `${field.label}: ${formatNumber(rows.reduce((sum, row) => sum + row[field.key], 0))}`).join('. ')}. Switch to Numbers for the full data table.</desc>{[0, 0.5, 1].map(ratio => <g key={ratio}><line x1="44" y1={y(max * ratio)} x2="644" y2={y(max * ratio)} stroke="currentColor" opacity="0.12" /><text x="36" y={y(max * ratio) + 4} textAnchor="end" fill="currentColor" fontSize="11">{Math.round(max * ratio)}</text></g>)}{fields.map(field => <g key={field.key}><polyline fill="none" stroke={field.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={rows.map((row, index) => `${x(index)},${y(row[field.key])}`).join(' ')} />{rows.length === 1 && <circle cx={x(0)} cy={y(rows[0][field.key])} r="4" fill={field.color} />}</g>)}<text x="44" y="230" fill="currentColor" fontSize="11">{rows[0].date}</text><text x="644" y="230" textAnchor="end" fill="currentColor" fontSize="11">{rows[rows.length - 1].date}</text></svg><figcaption className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-dark-300">{fields.map(field => <span key={field.key} className="inline-flex gap-2 items-center"><span className="w-2.5 h-2.5 rounded-full" style={{ background: field.color }} />{field.label}</span>)}</figcaption></figure>;
}
