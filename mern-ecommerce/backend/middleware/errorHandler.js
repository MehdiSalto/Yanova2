const httpError = require('../utils/httpError');
const { databaseFailureCode } = require('../utils/databaseHealth');
const notFound = (req, res, next) => next(httpError(404, 'This resource was not found.', 'NOT_FOUND'));
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected error occurred.';
  let code = typeof err.code === 'string' ? err.code : undefined;
  if (err.name === 'CastError') { status = 400; message = 'Invalid resource identifier.'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(' '); }
  if (err.code === 11000) { status = 409; message = 'A record with this value already exists.'; }
  if (err.code === 'LIMIT_FILE_SIZE') { status = 413; message = 'Image must be 5 MiB or smaller.'; }
  if (err.name === 'MulterError' && status === 500) { status = 400; message = 'Invalid image upload.'; }
  if (/^Mongo(Network|ServerSelection|Topology)/.test(err.name || '')) { status = 503; message = 'Database temporarily unavailable. Please try again.'; }
  if (/^Mongo/.test(err.name || '') && [13, 18].includes(err.code)) {
    status = 503; code = databaseFailureCode(err);
    message = 'Database access is unavailable. Please try again later.';
  }
  if (status >= 500) {
    // Never log connection strings, request bodies, passwords or JWTs.
    console.error(JSON.stringify({ method: req.method, path: req.path, error: err.name || 'Error', ...(Number.isInteger(err.code) ? { code: err.code } : {}) }));
    if (status !== 503) message = 'An unexpected server error occurred. Please try again.';
  }
  res.status(status).json({ message, ...(code ? { code } : {}) });
};
module.exports = { notFound, errorHandler };
