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

// Helper function to properly parse cookies
const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  
  return cookieString.split(';')
    .map(cookie => cookie.trim().split('='))
    .reduce((cookies, [key, value]) => {
      cookies[key] = value;
      return cookies;
    }, {});
};

// Helper function to extract token from multiple sources
const extractToken = (socket) => {
  // Try to get from auth object
  if (socket.handshake.auth && socket.handshake.auth.token) {
    return socket.handshake.auth.token;
  }
  
  // Try to get from query params
  if (socket.handshake.query && socket.handshake.query.token) {
    return socket.handshake.query.token;
  }
  
  // Try to get from cookies
  if (socket.handshake.headers.cookie) {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    return cookies.token || cookies['auth-token'] || cookies.jwt;
  }
  
  return null;
};

const socketService = (io) => {
  const emailToSocketMapping = new Map();
  const socketToEmailMapping = new Map();

  io.on("connection", (socket) => {
    console.log(`User Connected : ${socket.id}`);
    console.log("Auth object:", socket.handshake.auth);
    console.log("Query params:", socket.handshake.query);
    console.log("Cookies:", socket.handshake.headers.cookie);

    // Listen for the 'sendMessage' event from the client
    socket.on("sendMessage", async (message) => {
      console.log("Received message:", message);

      try {
        // Extract token using the helper function
        const token = extractToken(socket);
        
        if (!token) {
          console.error("No valid authentication token found");
          socket.emit("messageError", { error: "Authentication failed. No valid token provided." });
          return;
        }

        console.log("Found token:", token);

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

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
        socket.emit("messageError", { error: "Failed to send message: " + error.message });
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
