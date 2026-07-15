import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

const sections = [
  { id: 'privacy', label: 'Privacy Policy', field: 'privacyPolicy' },
  { id: 'refund', label: 'Refund Policy', field: 'refundPolicy' },
  { id: 'shipping', label: 'Shipping Policy', field: 'shippingPolicy' },
  { id: 'terms', label: 'Terms & Conditions', field: 'termsConditions' },
];

const PoliciesPage = () => {
  const { admin } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeSection, setActiveSection] = useState('privacy');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.get();
      setSettings(data);
      setEditForm(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, policies: { ...prev.policies, [field]: value } }));
  };

  const handleSave = async () => {
    try {
      await settingsAPI.updatePolicies(editForm);
      setSettings(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeField = sections.find((s) => s.id === activeSection)?.field;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="mb-12 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="eyebrow">TRANSPARENCY MATTERS</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Legal Policies</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Important legal information regarding your use of our services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="glass-strong p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Policies</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-gold-500/10 text-gold-600 border border-gold-500/30'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="glass-strong p-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      {sections.find((s) => s.id === activeSection)?.label}
                    </label>
                    <textarea
                      value={editForm.policies?.[activeField] || ''}
                      onChange={(e) => handleChange(activeField, e.target.value)}
                      rows={12}
                      className="input-field resize-none w-full font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-4 pt-6 border-t border-gray-100">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                      <FiSave className="w-5 h-5" /> Save Changes
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditForm(settings); }} className="btn-secondary flex items-center gap-2">
                      <FiX className="w-5 h-5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black">{sections.find((s) => s.id === activeSection)?.label}</h2>
                    {admin && (
                      <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                        <FiEdit2 className="w-5 h-5" /> Edit
                      </button>
                    )}
                  </div>
                  <div className="text-gray-500 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                    {settings.policies?.[activeField] || 'No content available yet. Click edit to add.'}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
