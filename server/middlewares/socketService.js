const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");

const socketService = (io) => {
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

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketService;
