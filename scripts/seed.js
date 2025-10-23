const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const mock = require('../constants/mockSeed.json');
require('dotenv').config({ path: __dirname + '/../.env' });

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lastmile';

async function seed() {
  await mongoose.connect(uri);
  console.log('Connected to DB for seeding');
  await Order.deleteMany({});
  const created = await Order.create(mock);
  console.log('Seeded orders:', created.length);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
