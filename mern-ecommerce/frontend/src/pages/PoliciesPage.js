import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSite } from '../context/SiteContext';
const sections=[['privacy','Privacy policy','privacyPolicy'],['refund','Refund policy','refundPolicy'],['shipping','Shipping policy','shippingPolicy'],['terms','Terms and conditions','termsConditions']];
const PoliciesPage=()=>{
  const {settings,loading,error,retry}=useSite();const [params,setParams]=useSearchParams();
  const active=sections.find(([id])=>id===params.get('section'))||sections[0];
  return <div className="max-w-7xl mx-auto px-4 py-12"><Helmet><title>{active[1]} | {settings?.siteInfo?.siteName||'YANOBEN'}</title></Helmet><p className="eyebrow">Our policies</p><h1 className="text-4xl font-black mb-10">Policies</h1><div className="grid lg:grid-cols-4 gap-7"><nav className="glass-strong p-5 h-fit space-y-2" aria-label="Policies">{sections.map(([id,label])=><button key={id} onClick={()=>setParams({section:id})} className={`w-full text-left px-4 py-3 rounded-lg ${active[0]===id?'bg-gold-500/10 text-gold-600 font-bold':'text-muted'}`}>{label}</button>)}</nav><section className="glass-strong p-7 lg:col-span-3"><h2 className="text-2xl font-black mb-6">{active[1]}</h2>{loading?<p role="status">Loading…</p>:error?<div role="alert">{error}<button onClick={retry} className="underline ml-3">Retry</button></div>:<p className="text-muted leading-relaxed whitespace-pre-wrap">{settings?.policies?.[active[2]]||'Please contact us for information about this policy.'}</p>}</section></div></div>;
};
export default PoliciesPage;
