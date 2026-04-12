const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import Routes
const MyRouter = require('./routes/MyRouter');

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Socket.io setup (Required for live count updates in DonorController)
const io = new Server(server, {
  cors: {
    origin: "*", // Update this with your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected for live updates:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (For Event and Gallery Images)
app.use('/Events', express.static(path.join(__dirname, 'Events')));
app.use('/Gallery', express.static(path.join(__dirname, 'Gallery')));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood_donation_db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully...'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Mount Routes
app.use('/api', MyRouter);

// Default Route
app.get('/', (req, res) => {
  res.send('Blood Donation Backend is Running!');
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
