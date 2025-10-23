const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'partner'], default: 'user' },
    phone: { type: String },
    vehicleNumber: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
