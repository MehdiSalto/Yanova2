import { mediaUrl } from '../services/api';

export const responsiveImage = (value, widths = [320, 640, 960]) => {
  const original = mediaUrl(value);
  // Restrict transformations to normal, versioned Cloudinary upload URLs.
  // Signed URLs, external hosts and existing local images retain their URL.
  if (!/^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\/v\d+\//.test(original || '')) return { src: original };
  const transform = width => original.replace('/image/upload/', `/image/upload/f_auto/q_auto/c_limit,w_${width}/`);
  return { src: transform(widths[Math.min(1, widths.length - 1)]), srcSet: widths.map(width => `${transform(width)} ${width}w`).join(', ') };
};
export default function StoreImage({ src, alt, widths, sizes = '(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw', priority = false, ...props }) {
  return <img {...responsiveImage(src, widths)} alt={alt} sizes={sizes} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" {...props}/>;
}
