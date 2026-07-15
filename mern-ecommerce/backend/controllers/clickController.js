const Click = require('../models/Click');

const registerVisit = async (req, res) => {
  const { device, path } = req.body;
  await Click.create({ type: 'visit', device, path });
  const io = req.app.get('io');
  io?.emit('analytics:update', { type: 'visit' });
  res.status(201).json({ message: 'Visit recorded' });
};

module.exports = { registerVisit };
