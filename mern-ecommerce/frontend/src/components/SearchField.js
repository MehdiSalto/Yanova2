import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchField({ value, onChange, label = 'Search products', placeholder = 'Search by product name…', className = '' }) {
  return <label className={`search-field ${className}`}>
    <span className="sr-only">{label}</span>
    <FiSearch className="search-icon" aria-hidden="true" />
    <input type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />
    {value && <button type="button" className="search-clear" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => onChange('')}><FiX aria-hidden="true" /></button>}
  </label>;
}
