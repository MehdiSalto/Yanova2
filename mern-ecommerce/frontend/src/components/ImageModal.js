import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const ImageModal = ({ imageUrl, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <FiX className="w-6 h-6" />
      </button>

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
          aria-label="Previous"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
      )}

      <motion.img
        src={imageUrl}
        alt="Preview"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      />

      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
          aria-label="Next"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      )}
    </motion.div>
  );
};

export default ImageModal;
