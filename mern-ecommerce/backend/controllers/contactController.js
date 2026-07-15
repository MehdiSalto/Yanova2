const Contact = require('../models/Contact');

const submitContact = async (req, res) => {
  const { fullName, email, subject, message } = req.body;
  const contact = await Contact.create({ fullName, email, subject, message });
  const io = req.app.get('io');
  io?.emit('contact:new', { id: contact._id });
  res.status(201).json({ message: 'Your request has been submitted successfully' });
};

const getContacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json({ contacts });
};

const markAsRead = async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  if (!contact) return res.status(404).json({ message: 'Contact not found' });
  res.json(contact);
};

const deleteContact = async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ message: 'Contact not found' });
  res.json({ message: 'Contact deleted' });
};

module.exports = { submitContact, getContacts, markAsRead, deleteContact };
