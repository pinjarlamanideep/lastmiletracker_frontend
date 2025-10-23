const mongoose = require('mongoose');

const statusUpdateSchema = new mongoose.Schema({
  status: String,
  timestamp: String,
  icon: String,
});

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    customerName: String,
    customerPhone: String,
    deliveryAddress: String,
    pickupAddress: String,
    status: { type: String, enum: ['pending', 'picked_up', 'on_the_way', 'delivered'], default: 'pending' },
    eta: String,
    deliveryBoyName: String,
    deliveryBoyPhone: String,
    items: String,
    weight: String,
    instructions: String,
    statusHistory: [statusUpdateSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
