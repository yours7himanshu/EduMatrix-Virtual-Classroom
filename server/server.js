const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const http = require("http");
const socketIo = require("socket.io");
const chatController = require("./controllers/chatController");
require('dotenv').config();
const announcementRoutes = require("./routes/announcementRoutes");
const teacherRoutes = require('./routes/teachersRoutes');
const studentRoutes = require('./routes/studentRoutes');
const connectCloudinary = require('./config/cloudinary');
const lectureRoutes = require('./routes/lectureRoutes');
const quizRoutes = require('./routes/quizessRoutes');

const app = express();

// Connecting database
connectDb();

// Initializing Cloudinary
connectCloudinary();

// Middlewares
app.use(cors());

// Parsing form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinLecture", (lectureId) => {
        socket.join(lectureId);
        console.log(`User joined lecture: ${lectureId}`);
    });

    socket.on("sendMessage", async (data) => {
        io.to(data.lectureId).emit("receiveMessage", data);
        await chatController.createChatMessage(data);
    });

   

    socket.on("videoOffer", (data) => {
        socket.to(data.lectureId).emit("videoOffer", data.offer);
    });

    socket.on("videoAnswer", (data) => {
        socket.to(data.lectureId).emit("videoAnswer", data.answer);
    });

    socket.on("iceCandidate", (data) => {
        socket.to(data.lectureId).emit("iceCandidate", data.candidate);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});



// Setting up API routes
app.use("/api/lectures", lectureRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v2', adminRoutes);
app.use('/api/v3', announcementRoutes);
app.use('/api/v4', teacherRoutes);
app.use('/api/v5', studentRoutes);
app.use('/api',quizRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send("Welcome to my Server");
});

// Start server on the specified port
server.listen(process.env.PORT, () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
});
