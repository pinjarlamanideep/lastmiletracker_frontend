require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Store io instance for use in routes
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('joinOrder', (orderId) => {
        socket.join(orderId);
        console.log(`Client ${socket.id} joined order ${orderId}`);
      });

      socket.on('updateLocation', (data) => {
        const { orderId, location } = data;
        console.log(`Location update for order ${orderId}:`, location);
        socket.to(orderId).emit('locationUpdate', location);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
