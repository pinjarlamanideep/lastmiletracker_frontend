const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lastmile';
  await mongoose.connect(uri, {
    // useNewUrlParser etc not needed in mongoose v7+
  });
  console.log('MongoDB connected');
};

module.exports = connectDB;
