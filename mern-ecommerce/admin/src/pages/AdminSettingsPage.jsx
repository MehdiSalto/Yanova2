import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '../services/api';
import Loading from '../components/Loading';
import { FiSave, FiX } from 'react-icons/fi';

const sections = [
  { id: 'privacy', label: 'Privacy Policy', field: 'privacyPolicy' },
  { id: 'refund', label: 'Refund Policy', field: 'refundPolicy' },
  { id: 'shipping', label: 'Shipping Policy', field: 'shippingPolicy' },
  { id: 'terms', label: 'Terms & Conditions', field: 'termsConditions' },
];

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeSection, setActiveSection] = useState('privacy');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsAPI.get();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) return <Loading />;

  const activeField = sections.find((s) => s.id === activeSection)?.field;

  const startEdit = () => {
    setEditForm({
      aboutUs: { ...settings.aboutUs },
      policies: { ...settings.policies },
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateAbout({ aboutUs: editForm.aboutUs });
      await settingsAPI.updatePolicies({ policies: editForm.policies });
      const { data } = await settingsAPI.get();
      setSettings(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Configuration</p>
          <h1 className="text-3xl font-black">Settings</h1>
        </div>
        {!isEditing ? (
          <button onClick={startEdit} className="btn-primary flex items-center gap-2">
            Edit Content
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <FiSave className="w-5 h-5" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={cancelEdit} className="btn-secondary flex items-center gap-2">
              <FiX className="w-5 h-5" /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* About Us */}
      <div className="glass-strong p-6">
        <h2 className="text-xl font-bold mb-4">About Us</h2>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-300 mb-2">Story</label>
              <textarea
                value={editForm.aboutUs?.story || ''}
                onChange={(e) => setEditForm({ ...editForm, aboutUs: { ...editForm.aboutUs, story: e.target.value } })}
                className="input-field h-32 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-2">Contact Info</label>
              <textarea
                value={editForm.aboutUs?.contactInfo || ''}
                onChange={(e) => setEditForm({ ...editForm, aboutUs: { ...editForm.aboutUs, contactInfo: e.target.value } })}
                className="input-field h-24 resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-dark-400 text-sm mb-1">Story</p>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{settings.aboutUs?.story || 'Not set.'}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm mb-1">Contact Info</p>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{settings.aboutUs?.contactInfo || 'Not set.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Policies */}
      <div className="glass-strong p-6">
        <h2 className="text-xl font-bold mb-4">Policies</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeSection === s.id ? 'bg-gold-500 text-dark-950 font-semibold' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isEditing ? (
          <textarea
            value={editForm.policies?.[activeField] || ''}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                policies: { ...editForm.policies, [activeField]: e.target.value },
              })
            }
            className="input-field h-48 resize-none font-mono text-sm"
          />
        ) : (
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
            {settings.policies?.[activeField] || 'No content available yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
