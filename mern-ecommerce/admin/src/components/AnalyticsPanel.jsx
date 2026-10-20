import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiList, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { dashboardAPI, mediaUrl } from '../services/api';
import { useSocket } from '../context/SocketContext';
import ErrorNotice, { errorMessage } from './ErrorNotice';
import { Bars, TrendChart, countryName, formatNumber } from './AnalyticsCharts';
const initialMode = () => { try { return localStorage.getItem('yanoben:analytics-view') === 'charts' ? 'charts' : 'numbers'; } catch { return 'numbers'; } };
const Card = ({ title, detail, children }) => <section className="glass-strong p-4 sm:p-6 min-w-0"><h3 className="text-lg font-bold">{title}</h3>{detail && <p className="text-dark-400 text-xs mt-1 mb-5">{detail}</p>}<div className={detail ? '' : 'mt-5'}>{children}</div></section>;
const CountryData = ({ rows, mode, label }) => mode === 'charts'
  ? <Bars label={label} percentage rows={rows.map(row => ({ id: row.code, label: countryName(row.code), value: row.visitors, percentage: row.percentage }))} />
  : <div className="overflow-auto max-h-80"><table className="analytics-table"><thead><tr><th>Country</th><th>Visitors</th><th>Share</th></tr></thead><tbody>{rows.map(row => <tr key={row.code}><td>{countryName(row.code)} <span className="text-dark-400 text-xs">{row.code === 'ZZ' ? '' : row.code}</span></td><td>{formatNumber(row.visitors)}</td><td>{row.percentage.toFixed(2)}%</td></tr>)}</tbody></table>{!rows.length && <p className="analytics-empty">No visitors recorded yet.</p>}</div>;
function ActivityData({ data, mode, product }) {
  if (mode === 'charts') return <TrendChart rows={data.series} product={product} />;
  return <div className="overflow-auto max-h-80"><table className="analytics-table"><thead><tr><th>{data.range === 'all' ? 'Month' : 'Date'}</th><th>{product ? 'Unique viewers' : 'Unique visitors'}</th><th>{product ? 'Product views' : 'Page views'}</th><th>Outbound clicks</th></tr></thead><tbody>{data.series.map(row => <tr key={row.date}><td className="whitespace-nowrap">{row.date}</td><td>{formatNumber(row.visitors)}</td><td>{formatNumber(product ? row.productViews : row.pageViews)}</td><td>{formatNumber(row.outboundClicks)}</td></tr>)}</tbody></table>{!data.series.length && <p className="analytics-empty">No activity yet.</p>}</div>;
}
function ProductData({ items, mode }) {
  if (mode === 'charts') return <div className="space-y-6">{items.map(item => <div key={item._id}><Link to={`/products/${item._id}/analytics`} className="inline-flex items-center gap-2 font-semibold underline underline-offset-4 mb-3">{item.name}<FiExternalLink /></Link><Bars label={`${item.name} performance`} rows={[{ label: 'Product views', value: item.views }, { label: 'Buy Now clicks', value: item.outboundClicks }]} /></div>)}</div>;
  return <div className="overflow-x-auto"><table className="analytics-table"><thead><tr><th>Product</th><th>Views</th><th>Unique viewers</th><th>Buy Now clicks</th><th>Report</th></tr></thead><tbody>{items.map(item => <tr key={item._id}><td><div className="flex items-center gap-3 min-w-40"><img src={mediaUrl(item.imageUrl)} alt="" className="w-9 h-9 rounded object-cover" /><span>{item.name}<small className="block text-dark-400 mt-1">{item.status}</small></span></div></td><td>{formatNumber(item.views)}</td><td>{formatNumber(item.uniqueViewers)}</td><td>{formatNumber(item.outboundClicks)}</td><td><Link to={`/products/${item._id}/analytics`} className="underline underline-offset-4 whitespace-nowrap">View analytics<span className="sr-only"> for {item.name}</span></Link></td></tr>)}</tbody></table></div>;
}
export default function AnalyticsPanel({ productId }) {
  const [range, setRange] = useState('30d'); const [mode, setMode] = useState(initialMode);
  const [page, setPage] = useState(1); const [search, setSearch] = useState('');
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); const [retry, setRetry] = useState(0);
  const { revision, active: presence, presenceError } = useSocket();
  useEffect(() => {
    const abort = new AbortController(); let pending = false;
    const load = async () => {
      if (pending || abort.signal.aborted) return;
      pending = true; setLoading(true);
      try {
        const response = await dashboardAPI.getAnalytics({ range, productId, page, search }, { signal: abort.signal });
        setData(response.data); setError('');
      } catch (err) { if (!abort.signal.aborted) setError(errorMessage(err)); }
      finally { pending = false; if (!abort.signal.aborted) setLoading(false); }
    };
    const timer = setTimeout(load, search ? 250 : 0);
    const interval = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 30000);
    return () => { clearTimeout(timer); clearInterval(interval); abort.abort(); };
  }, [range, productId, page, search, revision, retry]);
  const changeMode = value => { setMode(value); try { localStorage.setItem('yanoben:analytics-view', value); } catch {} };
  const totals = data?.totals; const active = presence || data?.active;
  const metrics = productId
    ? [['Product views', totals?.productViews], ['Unique viewers', totals?.uniqueProductViewers], ['Buy Now outbound clicks', totals?.productClicks], ['Unique visitors who clicked', data?.products.items[0]?.uniqueClickers]]
    : [['Unique visitors', totals?.visitors], ['Page views', totals?.pageViews], ['Product views', totals?.productViews], ['Outbound clicks', totals?.outboundClicks]];
  const products = data?.products.items || [];
  return <section className="space-y-6" aria-label={productId ? 'Product analytics' : 'Store analytics'} aria-busy={loading}>
    <div className="flex flex-wrap justify-between items-end gap-4">
      <div><p className="eyebrow">{productId ? 'Product performance' : 'Visitor & product analytics'}</p><h2 className="text-2xl font-black">{productId ? data?.product?.name || 'Product analytics' : 'Understand your visitors'}</h2><p className="text-sm text-dark-400 mt-2">{productId ? 'Track product visibility and clicks on Buy Now.' : 'Active visitors, top countries and performance in one place.'}</p></div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-dark-400">Period<select aria-label="Analytics period" className="input-field mt-1 w-auto block py-2" value={range} onChange={event => { setRange(event.target.value); setPage(1); }}>{[['today', 'Today'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days'], ['all', 'All time']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div><p className="text-xs text-dark-400 mb-1">Display</p><div className="analytics-toggle" role="group" aria-label="Analytics display mode">{[['numbers', 'Numbers', FiList], ['charts', 'Charts', FiBarChart2]].map(([value, label, Icon]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => changeMode(value)} className={mode === value ? 'is-selected' : ''}><Icon />{label}</button>)}</div></div>
        <button aria-label="Refresh analytics" title="Refresh analytics" className="theme-toggle self-end" onClick={() => setRetry(value => value + 1)}><FiRefreshCw className={loading ? 'animate-spin' : ''} /></button>
      </div>
    </div>
    <ErrorNotice message={error} onRetry={() => setRetry(value => value + 1)} />
    {!data && !error && <p role="status" className="text-dark-400">Loading analytics…</p>}
    {data && <>
      <p className="text-xs text-dark-400" role="status">{loading ? 'Updating data…' : `Updated ${new Date(data.to).toLocaleTimeString()} · Auto-refresh every 30 seconds · Dates in UTC`}</p>
      {mode === 'numbers' ? <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">{metrics.map(([label, value]) => <div key={label} className="glass-strong p-4 sm:p-5"><p className="text-dark-400 text-sm">{label}</p><p className="text-3xl font-black mt-3 tabular-nums">{formatNumber(value)}</p></div>)}</div> : <Card title="Period totals" detail="Totals for the selected period"><Bars rows={metrics.map(([label, value]) => ({ label, value: value || 0 }))} /></Card>}
      {!productId && <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Active visitors now" detail="Distinct browsers seen within the last 2 minutes. Multiple tabs count once."><div className="flex items-center gap-3 mb-6"><span className="h-3 w-3 bg-emerald-500 rounded-full" /><strong className="text-4xl tabular-nums" data-testid="active-visitors">{active ? formatNumber(active.total) : '—'}</strong><span className="text-sm text-dark-400">active visitors</span></div>{presenceError && <p role="status" className="text-xs text-amber-600 mb-3">Live data could not refresh. Showing the last snapshot.</p>}<CountryData rows={active?.countries || []} mode={mode} label="Active visitors by country" /></Card>
        <Card title="Visitors by country" detail="Share of unique visitors in the selected period. Each browser is assigned to its latest country."><CountryData rows={data.countries} mode={mode} label="Visitor country share" /></Card>
      </div>}
      {productId && <Card title="Viewers by country" detail="Countries of unique product viewers in the selected period."><CountryData rows={data.countries} mode={mode} label="Product viewers by country" /></Card>}
      <Card title="Activity over time" detail={`${range === 'all' ? 'Monthly' : 'Daily'} activity for the selected period. Outbound clicks open an external seller.`}><ActivityData data={data} mode={mode} product={!!productId} /></Card>
      {!productId && <Card title="Product performance" detail="Every product has its own report. Search by name or open a report below.">
        <input aria-label="Search product analytics" placeholder="Search products…" className="input-field mb-5" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
        <ProductData items={products} mode={mode} />
        {!products.length && <p className="analytics-empty">No products found.</p>}
        <div className="flex justify-between items-center gap-3 mt-5 text-sm"><button className="btn-secondary disabled:opacity-40" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>{data.products.pagination.total} products · Page {page} / {Math.max(1, data.products.pagination.pages)}</span><button className="btn-secondary disabled:opacity-40" disabled={page >= data.products.pagination.pages || loading} onClick={() => setPage(value => value + 1)}>Next</button></div>
      </Card>}
      <Card title={productId ? 'Viewer devices' : 'Visitor devices'} detail="Unique browsers grouped by their latest device category.">{mode === 'charts' ? <Bars rows={data.devices.map(row => ({ label: row.device, value: row.visitors }))} /> : <div className="overflow-x-auto"><table className="analytics-table"><thead><tr><th>Device</th><th>Visitors</th></tr></thead><tbody>{data.devices.map(row => <tr key={row.device}><td className="capitalize">{row.device}</td><td>{formatNumber(row.visitors)}</td></tr>)}</tbody></table>{!data.devices.length && <p className="analytics-empty">No device data yet.</p>}</div>}</Card>
      <p className="text-dark-400 text-xs leading-relaxed">Unique visitors estimate distinct browsers, rather than identified people. Product views require at least 50% visibility for 1 second, once per page navigation. Multiple views can come from one visitor. Country is approximate; VPNs can change it. Unknown includes older records without a country. Authenticated admin traffic and known bots are excluded when detectable. New tracking starts after deployment; earlier product views cannot be reconstructed. Outbound clicks measure Buy Now or offer-link clicks, rather than purchases.</p>
    </>}
  </section>;
}
