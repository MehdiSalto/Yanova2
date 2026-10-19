const path = require('path');
const uploadsPath = () => process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(__dirname, '..', 'uploads');
module.exports = { uploadsPath };
