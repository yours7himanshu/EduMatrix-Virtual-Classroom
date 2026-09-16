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
    .map(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length < 2) {
        const ws = cookie.trim().split(/\s+/);
        return [ws[0].toLowerCase(), ws[1] || ''];
      }
      return [parts[0].toLowerCase(), parts.slice(1).join('=')];
    })
    .reduce((cookies, [key, value]) => { cookies[key] = value; return cookies; }, {});
};

// Helper function to extract token from multiple sources
const extractToken = (socket) => {
  // Try Authorization header
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader) {
    return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }
  let token = null;

  // Try from auth object
  if (socket.handshake.auth && socket.handshake.auth.token) {
    token = socket.handshake.auth.token;
  } else if (socket.handshake.query && socket.handshake.query.token) {
    // Try from query params
    token = socket.handshake.query.token;
  } else if (socket.handshake.headers.cookie) {
    // Try from cookies
    const cookies = parseCookies(socket.handshake.headers.cookie);
    token = cookies.token || cookies.jwt;
  }

  // Invalidate literal 'null', 'undefined', or empty
  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }

  return token;
};

const socketService = (io) => {
  io.on("connection", (socket) => {
    console.log(`User Connected : ${socket.id}`);

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

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Determine sender identity safely
        const senderIdentity = decoded.name || decoded.role || "Student";

        // Save message to the database
        const newMessage = await Message.create({
          sender: senderIdentity,
          content: message.content,
          timestamp: new Date(),
        });
        console.log("Message saved to DB:", newMessage);

        // Broadcast the message to all connected clients
        socket.broadcast.emit("receiveMessage", {
          sender: senderIdentity,
          content: message.content,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error sending the message:", error);
        socket.emit("messageError", { error: "Failed to send message: " + error.message });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketService;
