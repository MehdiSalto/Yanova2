import { useSite } from '../context/SiteContext';
import { mediaUrl } from '../services/api';
const SiteBanners=({position})=>{
  const {banners}=useSite();const items=banners.filter(banner=>banner.position===position);
  if(!items.length)return null;
  return <section aria-label={`${position} promotions`} className="max-w-7xl mx-auto px-4 py-6 space-y-4">{items.map(banner=>{const content=<img src={mediaUrl(banner.imageUrl)} alt={banner.title} className="w-full max-h-96 rounded-xl object-cover" loading="lazy"/>;return banner.linkUrl?<a className="block" key={banner._id} href={banner.linkUrl} target={banner.linkUrl.startsWith('http')?'_blank':undefined} rel="noopener noreferrer">{content}</a>:<div key={banner._id}>{content}</div>;})}</section>;
};
export default SiteBanners;
