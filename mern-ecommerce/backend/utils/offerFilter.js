module.exports = () => ({ status: 'published', $and: [
  { $or: [{ startsAt: null }, { startsAt: { $lte: new Date() } }] },
  { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
] });
