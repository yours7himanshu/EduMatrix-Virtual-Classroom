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


const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");

const socketService = (io) => {

  const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();


  io.on("connection", (socket) => {
    console.log(`User Connected : ${socket.id}`);

    // Listen for the 'sendMessage' event from the client
    socket.on("sendMessage", async (message) => {
      console.log("Received message:", message);

      try {
        // Extract token from cookies
        const token = socket.handshake.headers.cookie?.split("=")[1]; // Extract token from cookies
        if (!token) {
          console.error("Token is missing in cookies.");
          return; // Exit early if no token
        }

        console.log("Token from client:", token);

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded); // Log the decoded token for debugging

        console.log("Cookies from handshake:", socket.handshake.headers.cookie);

        // Save message to the database
        const newMessage = await Message.create({
          sender: decoded.role,
          content: message.content,
          timestamp: new Date(),
        });
        console.log("Message saved to DB:", newMessage);

        // Broadcast the message to all connected clients
        socket.broadcast.emit("receiveMessage", {
          sender: decoded.role,
          content: message.content,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error sending the message:", error);
        socket.emit("Failed to send message");
      }
    });

    socket.on("join-room", (data) => {
      const { roomId, emailId } = data;
      console.log("User", emailId, "Joined Room", roomId);
      emailToSocketMapping.set(emailId, socket.id);
      socketToEmailMapping.set(socket.id, emailId);
      socket.join(roomId);
      socket.emit("joined-room", { roomId });
      socket.broadcast.to(roomId).emit("user-joined", { emailId });
    });
  
    socket.on('call-user', (data) => {
      const { emailId, offer } = data;
      const fromEmail = socketToEmailMapping.get(socket.id);
      const socketId = emailToSocketMapping.get(emailId);
      if (socketId) {
        socket.to(socketId).emit('incomming-call', { from: fromEmail, offer });
      }
    });
  
    socket.on('call-accepted', (data) => {
      const { emailId, ans } = data;
      const socketId = emailToSocketMapping.get(emailId);
      if (socketId) {
        socket.to(socketId).emit('call-accepted', { ans });
      }
    });
  
    socket.on('ice-candidate', (data) => {
      const { candidate, to } = data;
      const socketId = emailToSocketMapping.get(to);
      if (socketId) {
        socket.to(socketId).emit('ice-candidate', { candidate });
      }
    });
  
    socket.on('renegotiate', (data) => {
      const { offer, to } = data;
      const socketId = emailToSocketMapping.get(to);
      if (socketId) {
        socket.to(socketId).emit('renegotiate', { offer });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketService;
