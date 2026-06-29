const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  name: String,
  password: String,
  type: { type: String, enum: ['registration', 'password_reset'], required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 600 } },
});

module.exports = mongoose.model('Otp', otpSchema);
