import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };

  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <FiLoader className={`${sizeClasses[size]} text-gold-500`} />
    </motion.div>
  );
};

const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClass = 'animate-pulse bg-gray-100 rounded';
  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    card: 'aspect-square w-full',
    avatar: 'w-12 h-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
    circle: 'w-12 h-12 rounded-full',
  };

  return <div className={`${baseClass} ${variantClasses[variant]} ${className}`} />;
};

const CardSkeleton = () => (
  <div className="glass rounded-2xl overflow-hidden">
    <Skeleton variant="card" />
    <div className="p-5 space-y-3">
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="button" className="w-20" />
        <Skeleton variant="button" className="w-24" />
      </div>
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
    </div>
  </div>
);

export { LoadingSpinner, Skeleton, CardSkeleton, PageSkeleton };
