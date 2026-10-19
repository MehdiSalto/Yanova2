const notifyAdmins = (req, event, data) => req.app.get('io')?.to('admins').emit(event, data);
module.exports = { notifyAdmins };
