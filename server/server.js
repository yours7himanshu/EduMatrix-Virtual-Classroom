const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatController = require('./controllers/chatController');
const announcementRoutes = require('./routes/announcementRoutes');
const teacherRoutes = require('./routes/teachersRoutes');
const studentRoutes = require('./routes/studentRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const quizRoutes = require('./routes/quizessRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const connectCloudinary = require('./config/cloudinary');

// Initialize Express app and setup middlewares
const app = express();
connectDb(); // Connect database
connectCloudinary(); // Initialize Cloudinary
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinLecture', (lectureId) => {
    socket.join(lectureId);
    console.log(`User joined lecture: ${lectureId}`);
  });

  socket.on('sendMessage', async (data) => {
    io.to(data.lectureId).emit('receiveMessage', data);
    await chatController.createChatMessage(data);
  });

  socket.on('videoOffer', (data) => {
    socket.to(data.lectureId).emit('videoOffer', data);
  });

  socket.on('videoAnswer', (data) => {
    socket.to(data.lectureId).emit('videoAnswer', data);
  });

  socket.on('iceCandidate', (data) => {
    socket.to(data.lectureId).emit('iceCandidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API routes
app.use('/api/lectures', lectureRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v2', adminRoutes);
app.use('/api/v3', announcementRoutes);
app.use('/api/v4', teacherRoutes);
app.use('/api/v5', studentRoutes);
app.use('/api', quizRoutes);
app.use('/api/v7', assignmentRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Welcome to my Server');
});

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port: ${process.env.PORT}`);
});
