import { FiSearch, FiX } from 'react-icons/fi';

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative flex-1 min-w-[200px]">
    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field pl-10"
    />
  </div>
);

export const CategoryFilter = ({ value, onChange, categories }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="input-field w-auto min-w-[150px]"
  >
    <option value="">All Categories</option>
    {categories.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>
);

export const StatusFilter = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="input-field w-auto min-w-[150px]"
  >
    <option value="">All Status</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

export const ClearFilters = ({ onClick }) => (
  <button onClick={onClick} className="btn-secondary flex items-center gap-2">
    <FiX className="w-4 h-4" /> Clear
  </button>
);
