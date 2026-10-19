const mongoose = require('mongoose');
// Share one connection. Keep pool defaults until real workload data justifies tuning.
const connectDB = () => mongoose.connect(process.env.MONGO_URI);
module.exports = connectDB;
