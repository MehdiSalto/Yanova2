// Keep the legacy development server local unless the developer explicitly
// chooses a different HOST. Production uses the Express server and built files.
process.env.HOST = process.env.HOST || '127.0.0.1';
require('react-scripts/scripts/start');
