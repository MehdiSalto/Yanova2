const httpError = require('../utils/httpError');
const notFound = (req, res, next) => next(httpError(404, 'This resource was not found.', 'NOT_FOUND'));
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected error occurred.';
  if (err.name === 'CastError') { status = 400; message = 'Invalid resource identifier.'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(' '); }
  if (err.code === 11000) { status = 409; message = 'A record with this value already exists.'; }
  if (err.code === 'LIMIT_FILE_SIZE') { status = 413; message = 'Image must be 5 MiB or smaller.'; }
  if (err.name === 'MulterError' && status === 500) { status = 400; message = 'Invalid image upload.'; }
  if (/^Mongo(Network|ServerSelection|Topology)/.test(err.name || '')) { status = 503; message = 'Database temporarily unavailable. Please try again.'; }
  if (status >= 500) {
    // Never log connection strings, request bodies, passwords or JWTs.
    console.error(`${req.method} ${req.path}: ${err.name || 'Error'}`);
    if (status !== 503) message = 'An unexpected server error occurred. Please try again.';
  }
  res.status(status).json({ message, ...(typeof err.code === 'string' ? { code: err.code } : {}) });
};
module.exports = { notFound, errorHandler };
