import { motion } from 'framer-motion';
import { FiChevronDown, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { useState } from 'react';

const Select = ({ options, value, onChange, placeholder, className = '', disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" onClick={() => !disabled && setIsOpen(!isOpen)}>
      <div
        className={`flex items-center justify-between px-4 py-3 bg-surface border border-line rounded-md text-ink transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 focus-within:border-gold-500'
        } ${className}`}
      >
        <span>{value ? options.find((o) => o.value === value)?.label : placeholder}</span>
        <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-surface border border-line shadow-lg rounded-md overflow-hidden z-50"
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={(e) => { e.stopPropagation(); onChange(option.value); setIsOpen(false); }}
              className={`w-full px-4 py-3 text-left transition-colors ${
                value === option.value ? 'bg-gold-500/10 text-gold-600' : 'text-ink hover:bg-surface-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className="relative">
    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`input-field pl-12 ${className}`}
    />
  </div>
);

const FilterButton = ({ children, onClick, active, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
      active
        ? 'bg-gold-500/10 text-gold-600 border border-gold-500/30'
        : 'bg-surface text-muted hover:text-ink hover:bg-surface-muted border border-line'
    } ${className}`}
  >
    <FiFilter className="w-4 h-4" />
    {children}
  </button>
);

const ClearFilters = ({ onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-3 py-2 text-muted hover:text-ink text-sm transition-colors ${className}`}
  >
    <FiX className="w-4 h-4" />
    Clear
  </button>
);

export { Select, SearchInput, FilterButton, ClearFilters };
