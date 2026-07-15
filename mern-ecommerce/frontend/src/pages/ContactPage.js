import { useState } from 'react';
import { motion } from 'framer-motion';
import { contactAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiFileText, FiSend, FiCheckCircle, FiMapPin } from 'react-icons/fi';

const ContactPage = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Full name must be at least 2 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    else if (formData.subject.trim().length < 5) newErrors.subject = 'Subject must be at least 5 characters';

    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsSubmitting(true);
    try {
      await contactAPI.submit(formData);
      setIsSubmitted(true);
      toast.success('Your request has been submitted successfully!');
      setFormData({ fullName: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          className="max-w-md mx-auto text-center glass-strong p-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-gold-500" />
          </div>
          <h1 className="text-3xl font-black mb-4">Request Submitted!</h1>
          <p className="text-gray-500 mb-8">Thank you for your request. Our team will review it and get back to you soon.</p>
          <button onClick={() => setIsSubmitted(false)} className="btn-primary">Submit Another Request</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="eyebrow">WE'RE HERE TO HELP</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">Get in Touch</h1>
          <p className="text-gray-500 max-w-2xl">
            Have questions, suggestions, or need assistance? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="glass-strong p-8 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-gray-500 text-sm">support@yanova.com</p>
                    <p className="text-gray-500 text-sm">sales@yanova.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Visit Us</h3>
                    <p className="text-gray-500 text-sm">123 Commerce Street</p>
                    <p className="text-gray-500 text-sm">New York, NY 10001</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Support Hours</h3>
                    <p className="text-gray-500 text-sm">24/7 Customer Support</p>
                    <p className="text-gray-500 text-sm">Response time: within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="glass-strong p-8">
              <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 mb-2">Full Name *</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange}
                        className={`input-field pl-12 ${errors.fullName ? 'border-red-400' : ''}`} placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">Email Address *</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                        className={`input-field pl-12 ${errors.email ? 'border-red-400' : ''}`} placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-600 mb-2">Subject *</label>
                  <div className="relative">
                    <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange}
                      className={`input-field pl-12 ${errors.subject ? 'border-red-400' : ''}`} placeholder="Inquiry about products"
                    />
                  </div>
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-2">Message *</label>
                  <textarea
                    id="message" name="message" value={formData.message} onChange={handleChange} rows={6}
                    className={`input-field resize-none ${errors.message ? 'border-red-400' : ''}`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit" disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
