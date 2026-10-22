import StoreImage from './StoreImage';
import { motion } from 'framer-motion';
import { FiExternalLink, FiShoppingCart } from 'react-icons/fi';
import { productAPI } from '../services/api';
import useProductView from '../hooks/useProductView';

const getDevice = () => {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
};

const ProductCard = ({ product }) => {
  const viewRef = useProductView(product._id);
  const discountPrice = product.discount > 0
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : null;

  const handleBuy = (e) => {
    e.stopPropagation();
    productAPI.click(product._id, getDevice()).catch(() => {});
    window.open(product.buyLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.article
      ref={viewRef}
      className="group glass card-hover rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="product-visual relative aspect-square overflow-hidden bg-surface-muted">
        <StoreImage
          src={product.imageUrl}
          width="640" height="640"
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"

        />
        {product.discount > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          </div>
        )}
        {product.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-ink mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-muted text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {discountPrice ? (
              <>
                <span className="text-2xl font-black text-ink">${discountPrice}</span>
                <span className="text-gray-400 line-through text-base">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-black text-ink">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleBuy}
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5"
            aria-label={`Buy ${product.name}`}
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>Buy Now</span>
            <FiExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;

