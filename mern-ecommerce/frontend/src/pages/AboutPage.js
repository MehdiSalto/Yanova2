import { Helmet } from 'react-helmet-async';
import { useSite } from '../context/SiteContext';
const AboutPage=()=>{
  const {settings,loading,error,retry}=useSite();
  if(loading)return <p role="status" className="p-12 text-center">Loading…</p>;
  if(error)return <div role="alert" className="p-12 text-center">{error}<button onClick={retry} className="underline ml-3">Retry</button></div>;
  const about=settings?.aboutUs||{};const name=settings?.siteInfo?.siteName||'YANOVA';
  return <div className="max-w-5xl mx-auto px-4 py-14"><Helmet><title>About us | {name}</title><meta name="description" content={`Learn about ${name} and contact our team.`}/></Helmet><p className="eyebrow text-center">Our journey</p><h1 className="text-4xl font-black mb-10 text-center">About {name}</h1><div className="space-y-6">{[['companyStory','Our story'],['mission','Our mission'],['vision','Our vision'],['contactInfo','Contact us']].filter(([key])=>about[key]).map(([key,title])=><section key={key} className="glass-strong p-7 sm:p-9"><h2 className="text-2xl font-black mb-4">{title}</h2><p className="text-gray-500 whitespace-pre-wrap">{about[key]}</p></section>)}{!Object.values(about).some(value=>typeof value==='string'&&value.trim())&&<p className="text-center text-gray-500">Contact us to learn more about {name}.</p>}</div></div>;
};
export default AboutPage;
