import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { contactAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PageSkeleton } from '../../components/Loading';
import { SearchInput, Select } from '../../components/FilterComponents';
import { FiMessageSquare, FiMail, FiCalendar, FiCheckCircle, FiX, FiEye, FiTrash2, FiFilter } from 'react-icons/fi';

const AdminContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Contacts' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data } = await contactAPI.getAll();
      setContacts(data.contacts);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await contactAPI.delete(id);
      toast.success('Contact deleted');
      setShowDeleteModal(null);
      fetchContacts();
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await contactAPI.markAsRead(id);
      fetchContacts();
    } catch (error) {
      toast.error('Failed to update contact');
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterBy === 'unread') return matchesSearch && !contact.isRead;
    if (filterBy === 'read') return matchesSearch && contact.isRead;
    return matchesSearch;
  });

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Contact Management</h1>
          <p className="text-white/60">Manage customer contact requests</p>
        </div>

        <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search contacts..." />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                showFilters ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
              }`}
            >
              <FiFilter className="w-5 h-5" /> Filters
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 pt-6 border-t border-white/10 max-w-xs">
                <Select options={filterOptions} value={filterBy} onChange={setFilterBy} placeholder="Select filter..." />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-16 bg-dark-900 border border-white/10 rounded-2xl">
            <FiMessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No contacts found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div key={contact._id} className="bg-dark-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/15 flex items-center justify-center">
                      <FiMail className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{contact.fullName}</h3>
                      <p className="text-white/40 text-sm">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${contact.isRead ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {contact.isRead ? 'Read' : 'Unread'}
                    </span>
                    <p className="text-white/40 text-xs flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {new Date(contact.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <h4 className="font-medium text-white mb-2 line-clamp-1">{contact.subject}</h4>
                <p className="text-white/60 text-sm line-clamp-2 mb-4">{contact.message}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedContact(contact); setShowViewModal(true); }} className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-2 rounded-xl flex items-center justify-center gap-2"><FiEye className="w-4 h-4" /> View</button>
                  {!contact.isRead && <button onClick={() => handleMarkAsRead(contact._id)} className="bg-green-500/15 hover:bg-green-500/25 text-green-400 px-3 py-2 rounded-xl"><FiCheckCircle className="w-4 h-4" /></button>}
                  <button onClick={() => setShowDeleteModal(contact._id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-xl"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showViewModal && selectedContact && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowViewModal(false)}>
            <motion.div className="bg-dark-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">Contact Details</h2>
                <button onClick={() => setShowViewModal(false)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"><FiX className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-white/70 mb-2">Full Name</label><p className="text-white bg-white/5 rounded-xl px-4 py-3">{selectedContact.fullName}</p></div>
                <div><label className="block text-sm font-medium text-white/70 mb-2">Email</label><p className="text-white bg-white/5 rounded-xl px-4 py-3">{selectedContact.email}</p></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-white/70 mb-2">Subject</label><p className="text-white bg-white/5 rounded-xl px-4 py-3">{selectedContact.subject}</p></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-white/70 mb-2">Message</label><p className="text-white bg-white/5 rounded-xl px-4 py-3 whitespace-pre-wrap min-h-[100px]">{selectedContact.message}</p></div>
                <div><label className="block text-sm font-medium text-white/70 mb-2">Submitted</label><p className="text-white bg-white/5 rounded-xl px-4 py-3">{new Date(selectedContact.createdAt).toLocaleString()}</p></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-xl font-bold text-white mb-4">Delete Contact</h3>
              <p className="text-white/60 mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl">Cancel</button>
                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-xl">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContactsPage;
