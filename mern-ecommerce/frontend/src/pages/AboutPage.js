import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '../services/api';
import { FiSave, FiX } from 'react-icons/fi';

const AboutPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

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
    setEditForm((prev) => ({ ...prev, aboutUs: { ...prev.aboutUs, [field]: value } }));
  };

  const handleSave = async () => {
    try {
      await settingsAPI.updateAbout(editForm);
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

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="mb-12 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="eyebrow">OUR JOURNEY</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">Our Story</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover the passion and vision behind YANOVA — your destination for smart, high-tech products.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="glass-strong p-8">
              {isEditing ? (
                <div className="space-y-6">
                  {['companyStory', 'mission', 'vision', 'contactInfo'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-600 mb-2 capitalize">
                        {field.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <textarea
                        value={editForm.aboutUs?.[field] || ''}
                        onChange={(e) => handleChange(field, e.target.value)}
                        rows={field === 'companyStory' ? 6 : 4}
                        className="input-field resize-none w-full"
                      />
                    </div>
                  ))}
                  <div className="flex gap-4">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                      <FiSave className="w-5 h-5" /> Save Changes
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditForm(settings); }} className="btn-secondary flex items-center gap-2">
                      <FiX className="w-5 h-5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black mb-4">Our Story</h2>
                    <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">
                      {settings.aboutUs?.companyStory || 'No company story available yet.'}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black mb-4">Our Mission</h2>
                    <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">
                      {settings.aboutUs?.mission || 'No mission statement available yet.'}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black mb-4">Our Vision</h2>
                    <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">
                      {settings.aboutUs?.vision || 'No vision statement available yet.'}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black mb-4">Contact Us</h2>
                    <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">
                      {settings.aboutUs?.contactInfo || 'No contact information available yet.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="glass-strong p-8 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Quick Stats</h2>
              <div className="space-y-4">
                {[
                  ['Total Products', '1,234'],
                  ['Happy Customers', '10,000+'],
                  ['Active Offers', '89'],
                  ['Countries Served', '42'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="font-black">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
