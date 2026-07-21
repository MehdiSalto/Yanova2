import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { contactsAPI } from '../services/api';
import Loading from '../components/Loading';
import { SearchBar, StatusFilter, ClearFilters } from '../components/FilterComponents';
import { FiMail, FiPhone, FiCheck, FiTrash2 } from 'react-icons/fi';

const STATUS_OPTIONS = ['new', 'read', 'replied'];

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchContacts = async () => {
    try {
      const { data } = await contactsAPI.getAll();
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await contactsAPI.update(id, { status: newStatus });
      fetchContacts();
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await contactsAPI.delete(id);
      fetchContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || c.status === status;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="eyebrow">Inbox</p>
        <h1 className="text-3xl font-black">Contacts</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search messages..." />
        <StatusFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        {(search || status) && <ClearFilters onClick={() => { setSearch(''); setStatus(''); }} />}
      </div>

      <div className="space-y-4">
        {filtered.map((c) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold">{c.name}</h3>
                <div className="flex items-center gap-4 text-sm text-dark-400 mt-1">
                  <span className="flex items-center gap-1">
                    <FiMail className="w-4 h-4" /> {c.email}
                  </span>
                  {c.phone && (
                    <span className="flex items-center gap-1">
                      <FiPhone className="w-4 h-4" /> {c.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c._id, e.target.value)}
                  className="bg-dark-800 border border-dark-700 rounded px-3 py-1 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => updateStatus(c._id, 'replied')}
                  className="p-2 hover:bg-dark-700 rounded text-dark-300 hover:text-green-400"
                  title="Mark replied"
                >
                  <FiCheck className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(c._id)} className="p-2 hover:bg-dark-700 rounded text-dark-300 hover:text-red-400">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-dark-200 leading-relaxed">{c.message}</p>
            <p className="text-dark-500 text-xs mt-3">{new Date(c.createdAt).toLocaleString()}</p>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-dark-400 py-8">No messages found.</p>}
    </div>
  );
};

export default AdminContactsPage;
