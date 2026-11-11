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
      className="group glass card-hover flex h-full min-w-0 flex-col overflow-hidden rounded-xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="product-visual relative aspect-square shrink-0 overflow-hidden bg-surface-muted">
        <StoreImage
          src={product.imageUrl}
          width="640"
          height="640"
          alt={product.name}
          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
        />
        {product.discount > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-500 px-1.5 py-0.5 text-[9px] font-bold leading-tight text-black sm:left-2 sm:top-2 sm:px-2 sm:text-[10px]">
            -{product.discount}%
          </span>
        )}
        {product.featured && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-black px-1.5 py-0.5 text-[9px] font-bold leading-tight text-white sm:right-2 sm:top-2 sm:px-2 sm:text-[10px]">
            Featured
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-2.5">
        <h3 className="mb-2 min-h-[2.5em] break-words text-xs font-semibold leading-snug text-ink line-clamp-2 sm:text-sm">
          {product.name}
        </h3>
        <div className="mt-auto flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pb-2">
          {discountPrice ? (
            <>
              <span className="text-sm font-black leading-tight text-ink sm:text-base">${discountPrice}</span>
              <span className="text-[10px] leading-tight text-gray-400 line-through sm:text-xs">${Number(product.price).toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-black leading-tight text-ink sm:text-base">${Number(product.price).toFixed(2)}</span>
          )}
        </div>
        <button
          onClick={handleBuy}
          className="flex min-h-8 w-full items-center justify-center gap-1 rounded-md bg-gold-500 px-1.5 py-1.5 text-[10px] font-bold leading-tight text-black transition-colors hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-1 sm:min-h-9 sm:gap-1.5 sm:text-xs"
          aria-label={'Buy ' + product.name}
        >
          <FiShoppingCart className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span>Buy Now</span>
          <FiExternalLink className="hidden h-3 w-3 shrink-0 sm:block" />
        </button>
      </div>
    </motion.article>
  );
};

export default ProductCard;
