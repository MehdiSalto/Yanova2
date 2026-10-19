const Contact = require('../models/Contact');
const { list, search, pick } = require('../utils/pagination');
const { notifyAdmins } = require('../utils/events');
const httpError = require('../utils/httpError');
const submitContact = async (req, res) => {
  const contact = await Contact.create(pick(req.body, ['fullName','email','subject','message']));
  notifyAdmins(req, 'contact:new', { id: contact._id }); notifyAdmins(req, 'analytics:update', { type: 'contact' });
  res.status(201).json({ message: 'Your message has been submitted successfully.' });
};
const getContacts = async (req, res) => {
  const filter = {}; const term = search(req.query.search);
  if (term) filter.$or = [{ fullName: term }, { email: term }, { subject: term }, { message: term }];
  if (req.query.status === 'new') filter.isRead = false;
  if (req.query.status === 'read') filter.isRead = true;
  if (req.query.status === 'replied') filter.status = 'replied';
  res.json(await list(Contact, filter, req.query));
};
const updateStatus = async (req, res) => {
  const status = req.body.status || 'read';
  const contact = await Contact.findByIdAndUpdate(req.params.id, { $set: { status, isRead: status !== 'new' } }, { new: true, runValidators: true });
  if (!contact) throw httpError(404, 'Message not found.');
  notifyAdmins(req, 'analytics:update', { type: 'contact' }); res.json(contact);
};
const markAsRead = async (req, res) => { req.body.status = 'read'; return updateStatus(req, res); };
const deleteContact = async (req, res) => {
  if (!await Contact.findByIdAndDelete(req.params.id)) throw httpError(404, 'Message not found.');
  notifyAdmins(req, 'analytics:update', { type: 'contact' }); res.json({ message: 'Message deleted.' });
};
module.exports = { submitContact, getContacts, updateStatus, markAsRead, deleteContact };
