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
      className="group glass card-hover min-w-0 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden"
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
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
            <span className="bg-gold-500 text-black text-[8px] sm:text-[10px] lg:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          </div>
        )}
        {product.featured && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <span className="bg-black text-white text-[7px] sm:text-[9px] lg:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-1.5 sm:p-3 lg:p-4">
        <h3 className="font-bold text-[10px] leading-tight sm:text-sm lg:text-base text-ink mb-1 sm:mb-2 line-clamp-2 min-h-[2.4em]">{product.name}</h3>
        <p className="hidden sm:block text-muted text-xs lg:text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-1.5 sm:gap-2">
          <div className="flex flex-wrap items-baseline gap-x-1 sm:gap-x-2 min-w-0">
            {discountPrice ? (
              <>
                <span className="text-[10px] sm:text-lg lg:text-xl font-black text-ink">${discountPrice}</span>
                <span className="text-[8px] sm:text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-black text-ink">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleBuy}
            className="btn-primary w-full sm:w-auto text-[9px] sm:text-xs px-1.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 flex items-center justify-center gap-1"
            aria-label={`Buy ${product.name}`}
          >
            <FiShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Buy Now</span>
            <FiExternalLink className="hidden lg:inline w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;

