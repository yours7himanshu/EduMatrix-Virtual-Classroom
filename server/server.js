
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
const multer = require('multer');
const connectDb = require('./db/db');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
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
const questionUploadRoutes = require('./routes/questionUploadRoutes');
const analysisRoutes = require('./routes/analysisRoute');
const summarizationRoutes = require('./routes/summarizationRoutes');
const studentMarksAttendanceRoutes = require('./routes/studentMarksAttendanceRoutes');
const registrarStudentRoute = require('./routes/registrarStudentRoute');
// const aiPredictRoutes = require('./routes/aiPredictorRoutes');
const aiPredictRoutes = require('./routes/aiPredictorRoutes');
const { paymentRouter } = require('./routes/paymentRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const liveRoutes = require('./routes/liveRoutes');
const adminFeeStructureRoutes = require('./routes/adminFeeStructureRoutes');



dotenv.config();
// Initialize Express app and setup middlewares
const app = express();
connectDb(); // Connect database
connectCloudinary(); // Initialize Cloudinary
const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigins = configuredOrigins.length > 0
  ? configuredOrigins
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:8081", "https://virtual-classroom-admin.vercel.app", "https://virtual-classroom-application.vercel.app"];
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Socket.IO setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

app.set('io', io);
socketService(io);

// API routes

app.use('/api', aiRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v2', adminRoutes);
app.use('/api/v3', announcementRoutes);
app.use('/api/v4', teacherRoutes);
app.use('/api/v5', studentRoutes);
app.use('/api', quizRoutes);
app.use('/api/v7', assignmentRoutes);
app.use("/api/ai", localAIRoutes);
app.use('/api', feedbackRouter);
app.use('/api', questionUploadRoutes);
app.use('/api', analysisRoutes)
app.use('/api', summarizationRoutes);
app.use('/api/v6', studentMarksAttendanceRoutes);
app.use('/api/v8', registrarStudentRoute);
app.use('/api/v9', aiPredictRoutes);
app.use('/api/v10', paymentRouter);
app.use('/api/v10/admin', adminFeeStructureRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/live', liveRoutes);

// Centralized error handling middleware for Multer and upload validations
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum allowed size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err && err.message && (err.message.includes('Invalid file type') || err.message.includes('file type'))) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Catch-all safe error handling middleware (prevents leaking internal stack traces)
  if (res.headersSent) {
    return next(err);
  }

  const isProd = process.env.NODE_ENV === "production";
  return res.status(err.status || 500).json({
    success: false,
    message: isProd ? "An internal server error occurred" : (err.message || "Internal server error"),
  });
});



// Health check route
app.get('/', (req, res) => {
  res.send('Welcome to my Server');
});


// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

