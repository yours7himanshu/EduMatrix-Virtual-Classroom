
/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();
const aiRoutes = require('./routes/aiAssistentRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const teacherRoutes = require('./routes/teachersRoutes');
const studentRoutes = require('./routes/studentRoutes');
const quizRoutes = require('./routes/quizessRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const connectCloudinary = require('./config/cloudinary');
const cookieParser = require('cookie-parser');
const socketService = require('./middlewares/socketService');
const localAIRoutes = require('./routes/aiRoutes');
const feedbackRouter = require('./routes/feedbackRoute');
// Initialize Express app and setup middlewares
const app = express();
connectDb(); // Connect database
connectCloudinary(); // Initialize Cloudinary
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174","https://virtual-classroom-admin.vercel.app","https://virtual-classroom-application.vercel.app"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Socket.IO setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174","https://virtual-classroom-admin.vercel.app","https://virtual-classroom-application.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

socketService(io);

// API routes

app.use('/api',aiRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v2', adminRoutes);
app.use('/api/v3', announcementRoutes);
app.use('/api/v4', teacherRoutes);
app.use('/api/v5', studentRoutes);
app.use('/api', quizRoutes);
app.use('/api/v7', assignmentRoutes);
app.use("/api/ai", localAIRoutes);
app.use('/api',feedbackRouter);


// Health check route
app.get('/', (req, res) => {
  res.send('Welcome to my Server');
});

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is listening on port: ${process.env.PORT}`);
});
