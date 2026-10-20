const Sponsorship = require('../models/Sponsorship');
const { groups, fields, consentQuestion } = require('../config/sponsorshipForm');
const { list, search, pick } = require('../utils/pagination');
const { notifyAdmins } = require('../utils/events');
const httpError = require('../utils/httpError');
const getForm = (req, res) => res.json({ groups, consentQuestion });
const submit = async (req, res) => {
  try { await Sponsorship.create(pick(req.body, [...fields.map(field => field.key), 'submissionId', 'contactConsent'])); }
  catch (error) {
    if (error.code === 11000) return res.status(200).json({ message: 'Your sponsorship request has been received.' });
    throw error;
  }
  notifyAdmins(req, 'analytics:update', { type: 'sponsorship' });
  res.status(201).json({ message: 'Your sponsorship request has been received.' });
};
const getRequests = async (req, res) => {
  const filter = {}; const term = search(req.query.search);
  if (term) filter.$or = ['fullName', 'companyName', 'email', 'promotedItem'].map(key => ({ [key]: term }));
  if (req.query.status) filter.status = req.query.status;
  res.set('Cache-Control', 'private, no-store').json(await list(Sponsorship, filter, req.query));
};
const update = async (req, res) => {
  const item = await Sponsorship.findByIdAndUpdate(req.params.id, { $set: pick(req.body, ['status', 'internalNotes']) }, { new: true, runValidators: true });
  if (!item) throw httpError(404, 'Sponsorship request not found.');
  notifyAdmins(req, 'analytics:update', { type: 'sponsorship' });
  res.json(item);
};
const remove = async (req, res) => {
  if (!await Sponsorship.findByIdAndDelete(req.params.id)) throw httpError(404, 'Sponsorship request not found.');
  notifyAdmins(req, 'analytics:update', { type: 'sponsorship' });
  res.json({ message: 'Sponsorship request deleted.' });
};
module.exports = { getForm, submit, getRequests, update, remove };
