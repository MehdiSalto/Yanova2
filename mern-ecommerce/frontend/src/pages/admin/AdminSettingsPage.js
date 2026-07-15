import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../../components/Loading';
import { FiEdit2, FiSave, FiX, FiFileText, FiShield, FiGlobe, FiLock, FiCheckCircle } from 'react-icons/fi';

const tabs = [
  { id: 'about', label: 'About Us', icon: FiFileText },
  { id: 'privacy', label: 'Privacy Policy', icon: FiShield },
  { id: 'refund', label: 'Refund Policy', icon: FiCheckCircle },
  { id: 'shipping', label: 'Shipping Policy', icon: FiGlobe },
  { id: 'terms', label: 'Terms & Conditions', icon: FiLock },
];

const policyFieldFor = { privacy: 'privacyPolicy', refund: 'refundPolicy', shipping: 'shippingPolicy', terms: 'termsConditions' };

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.get();
      setSettings(data);
      setEditForm(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAboutChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, aboutUs: { ...prev.aboutUs, [field]: value } }));
  };

  const handlePolicyChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, policies: { ...prev.policies, [field]: value } }));
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'about') await settingsAPI.updateAbout(editForm);
      else await settingsAPI.updatePolicies(editForm);
      setSettings(editForm);
      setIsEditing(false);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <LoadingSpinner size="xl" className="min-h-screen" />;

  const policyField = policyFieldFor[activeTab];

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Site Settings</h1>
          <p className="text-white/60">Manage your website content and policies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Navigation</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-dark-900 border border-white/10 rounded-2xl p-8">
              {isEditing ? (
                <div className="space-y-6">
                  {activeTab === 'about' ? (
                    ['companyStory', 'mission', 'vision', 'contactInfo'].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-white/70 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                        <textarea
                          value={editForm.aboutUs?.[field] || ''}
                          onChange={(e) => handleAboutChange(field, e.target.value)}
                          rows={field === 'companyStory' ? 6 : 4}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500 resize-none"
                        />
                      </div>
                    ))
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">{tabs.find((t) => t.id === activeTab)?.label}</label>
                      <textarea
                        value={editForm.policies?.[policyField] || ''}
                        onChange={(e) => handlePolicyChange(policyField, e.target.value)}
                        rows={12}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold-500 resize-none font-mono text-sm"
                      />
                    </div>
                  )}
                  <div className="flex gap-4 pt-6 border-t border-white/10">
                    <button onClick={handleSave} className="bg-gold-500 hover:bg-gold-400 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2"><FiSave className="w-5 h-5" /> Save Changes</button>
                    <button onClick={() => { setIsEditing(false); setEditForm(settings); }} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl flex items-center gap-2"><FiX className="w-5 h-5" /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white">{tabs.find((t) => t.id === activeTab)?.label}</h2>
                    <button onClick={() => setIsEditing(true)} className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm"><FiEdit2 className="w-4 h-4" /> Edit</button>
                  </div>
                  <div className="text-white/60 leading-relaxed whitespace-pre-wrap text-sm space-y-6">
                    {activeTab === 'about' ? (
                      <>
                        <div><h3 className="text-lg font-bold text-white mb-2">Company Story</h3><p>{settings.aboutUs?.companyStory || 'No content yet.'}</p></div>
                        <div><h3 className="text-lg font-bold text-white mb-2">Mission</h3><p>{settings.aboutUs?.mission || 'No content yet.'}</p></div>
                        <div><h3 className="text-lg font-bold text-white mb-2">Vision</h3><p>{settings.aboutUs?.vision || 'No content yet.'}</p></div>
                        <div><h3 className="text-lg font-bold text-white mb-2">Contact Info</h3><p>{settings.aboutUs?.contactInfo || 'No content yet.'}</p></div>
                      </>
                    ) : (
                      <p className="font-mono">{settings.policies?.[policyField] || 'No content available yet. Click edit to add.'}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
