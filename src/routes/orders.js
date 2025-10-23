const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Create sample order (for seeding/testing)
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;
    const order = await Order.create(payload);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
});

// Get all orders (optionally filter by status)
router.get('/', auth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// Get order by id
router.get('/id/:id', auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// Get order by code (for user tracking)
router.get('/code/:code', async (req, res, next) => {
  try {
    const order = await Order.findOne({ code: req.params.code });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// Update order status (partner)
router.patch('/:id/status', auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    console.log(`Updating order ${req.params.id} to status ${status}`);
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log(`Order ${req.params.id} not found`);
      return res.status(404).json({ error: 'Order not found' });
    }
    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date().toLocaleString(), icon: 'truck' });
    await order.save();
    console.log(`Order ${req.params.id} updated successfully to ${status}`);
    res.json({ order });
  } catch (err) {
    console.error('Error updating order status:', err);
    next(err);
  }
});

module.exports = router;
