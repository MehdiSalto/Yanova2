import { motion } from 'framer-motion';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const toastIcons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
  warning: FiAlertTriangle,
};

const bgColors = {
  success: 'bg-white border-green-200',
  error: 'bg-white border-red-200',
  info: 'bg-white border-gray-200',
  warning: 'bg-white border-gold-500/40',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-gray-500',
  warning: 'text-gold-600',
};

const Toast = ({ type, message, onClose }) => {
  const Icon = toastIcons[type] || FiInfo;

  return (
    <motion.div
      className={`border rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md ${bgColors[type]}`}
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
      <p className="text-black text-sm flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-black transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <FiX className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Toast;
