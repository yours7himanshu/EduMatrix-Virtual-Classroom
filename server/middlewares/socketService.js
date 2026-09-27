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
const Classroom = require("../models/classroomModel");
const Enrollment = require("../models/enrollmentModel");

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
  if (!socket || !socket.handshake) return null;

  // Try Authorization header
  const authHeader = socket.handshake.headers ? socket.handshake.headers.authorization : null;
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
  } else if (socket.handshake.headers && socket.handshake.headers.cookie) {
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
  // Enforce Socket.IO handshake authentication middleware
  if (typeof io.use === "function") {
    io.use((socket, next) => {
      try {
        const token = extractToken(socket);
        if (!token) {
          return next(new Error("Authentication error: Token required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = (decoded.userId || decoded.collegeId || decoded.id || "").toString();
        if (!userId) {
          return next(new Error("Authentication error: Invalid token payload"));
        }

        socket.user = {
          id: userId,
          email: decoded.email,
          role: decoded.role || "student",
          name: decoded.name || decoded.role || "Student",
          institutionId: decoded.institutionId ? decoded.institutionId.toString() : null,
        };

        next();
      } catch (err) {
        return next(new Error("Authentication error: Invalid or expired token"));
      }
    });
  }

  io.on("connection", (socket) => {
    // Fallback authentication for environments/mocks bypassing io.use
    if (!socket.user) {
      const token = extractToken(socket);
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.user = {
            id: (decoded.userId || decoded.collegeId || decoded.id || "").toString(),
            email: decoded.email,
            role: decoded.role || "student",
            name: decoded.name || decoded.role || "Student",
            institutionId: decoded.institutionId ? decoded.institutionId.toString() : null,
          };
        } catch {
          // Unverified token
        }
      }
    }

    // Automatically join tenant and private user rooms upon connection
    if (socket.user) {
      if (socket.user.institutionId) {
        socket.join(`inst_${socket.user.institutionId}`);
      }
      if (socket.user.id) {
        socket.join(`user_${socket.user.id}`);
      }
    }

    // Track authorized classroom rooms joined by this socket
    socket.joinedClassrooms = socket.joinedClassrooms || new Set();

    // Message frequency tracking for rate limiting (sliding 5s window)
    const messageTimestamps = [];

    // Room authorization handler for joining classrooms
    const handleJoinClassroom = async (data, callback) => {
      try {
        if (!socket.user) {
          const errPayload = { error: "Authentication required" };
          socket.emit("roomError", errPayload);
          if (typeof callback === "function") callback({ success: false, ...errPayload });
          return;
        }

        const classroomId = typeof data === "string" ? data : (data && data.classroomId ? data.classroomId : null);
        if (!classroomId || !/^[0-9a-fA-F]{24}$/.test(classroomId)) {
          const errPayload = { error: "Invalid classroom ID format" };
          socket.emit("roomError", errPayload);
          if (typeof callback === "function") callback({ success: false, ...errPayload });
          return;
        }

        const classroom = await Classroom.findById(classroomId);
        if (!classroom || classroom.isActive === false) {
          const errPayload = { error: "Classroom not found or inactive" };
          socket.emit("roomError", errPayload);
          if (typeof callback === "function") callback({ success: false, ...errPayload });
          return;
        }

        // Institutional boundary check
        const classInstId = classroom.institutionId ? classroom.institutionId.toString() : null;
        if (!socket.user.institutionId || socket.user.institutionId !== classInstId) {
          const errPayload = { error: "Access denied: Institutional boundary violation" };
          socket.emit("roomError", errPayload);
          if (typeof callback === "function") callback({ success: false, ...errPayload });
          return;
        }

        // Role & Membership check
        const role = socket.user.role;
        let isAuthorized = false;

        if (role === "Director" || role === "Registrar") {
          isAuthorized = true; // Institutional administrator oversight
        } else if (role === "Teacher") {
          const teacherId = classroom.teacherId ? classroom.teacherId.toString() : null;
          isAuthorized = (teacherId === socket.user.id);
        } else if (role === "student" || role === "Student") {
          const enrollment = await Enrollment.findOne({
            classroomId: classroom._id,
            studentId: socket.user.id,
            status: "enrolled",
          });
          isAuthorized = !!enrollment;
        }

        if (!isAuthorized) {
          const errPayload = { error: "Access denied: Unauthorized role or not enrolled in classroom" };
          socket.emit("roomError", errPayload);
          if (typeof callback === "function") callback({ success: false, ...errPayload });
          return;
        }

        const roomName = `class_${classroomId}`;
        socket.join(roomName);
        socket.joinedClassrooms.add(classroomId.toString());

        socket.emit("classroomJoined", { classroomId });
        if (typeof callback === "function") callback({ success: true, classroomId });
      } catch (err) {
        console.error("Error joining classroom room:", err);
        const errPayload = { error: "Internal server error during room join" };
        socket.emit("roomError", errPayload);
        if (typeof callback === "function") callback({ success: false, ...errPayload });
      }
    };

    // Room leave handler
    const handleLeaveClassroom = (data, callback) => {
      const classroomId = typeof data === "string" ? data : (data && data.classroomId ? data.classroomId : null);
      if (classroomId) {
        const roomName = `class_${classroomId}`;
        socket.leave(roomName);
        if (socket.joinedClassrooms) {
          socket.joinedClassrooms.delete(classroomId.toString());
        }
        socket.emit("classroomLeft", { classroomId });
        if (typeof callback === "function") callback({ success: true, classroomId });
      }
    };

    socket.on("joinClassroom", handleJoinClassroom);
    socket.on("joinRoom", handleJoinClassroom);
    socket.on("leaveClassroom", handleLeaveClassroom);
    socket.on("leaveRoom", handleLeaveClassroom);

    // Listen for the 'sendMessage' event from the client
    socket.on("sendMessage", async (message) => {
      try {
        if (!socket.user) {
          socket.emit("messageError", { error: "Authentication failed. No valid token provided." });
          return;
        }

        // Validate payload structure
        if (!message || typeof message !== "object") {
          socket.emit("messageError", { error: "Invalid message payload" });
          return;
        }

        const content = typeof message.content === "string" ? message.content.trim() : "";
        if (!content || content.length === 0) {
          socket.emit("messageError", { error: "Message content cannot be empty" });
          return;
        }
        if (content.length > 5000) {
          socket.emit("messageError", { error: "Message exceeds maximum allowed length" });
          return;
        }

        // Rate limiting (max 10 messages in 5 seconds per socket)
        const now = Date.now();
        while (messageTimestamps.length > 0 && now - messageTimestamps[0] > 5000) {
          messageTimestamps.shift();
        }
        if (messageTimestamps.length >= 10) {
          socket.emit("messageError", { error: "Rate limit exceeded. Please wait before sending more messages." });
          return;
        }
        messageTimestamps.push(now);

        // Determine destination room and authorization
        let targetRoom = null;
        const classroomId = message.classroomId;

        if (classroomId) {
          if (!/^[0-9a-fA-F]{24}$/.test(classroomId)) {
            socket.emit("messageError", { error: "Invalid classroom identifier" });
            return;
          }
          const roomName = `class_${classroomId}`;
          const isMember = (socket.rooms && typeof socket.rooms.has === "function" && socket.rooms.has(roomName)) ||
                           (socket.joinedClassrooms && socket.joinedClassrooms.has(classroomId.toString()));

          if (!isMember) {
            socket.emit("messageError", { error: "Unauthorized: You have not joined this classroom" });
            return;
          }
          targetRoom = roomName;
        } else {
          // If no classroomId, route strictly to user's institutional room
          if (socket.user.institutionId) {
            targetRoom = `inst_${socket.user.institutionId}`;
          } else {
            // Standalone unassociated user: delivered only to their own socket room
            targetRoom = `user_${socket.user.id}`;
          }
        }

        // Authoritative sender identity derived from verified token
        const senderIdentity = socket.user.name || socket.user.role || "Student";

        // Save message to database
        const newMessage = await Message.create({
          sender: senderIdentity,
          content: content,
          timestamp: new Date(),
        });

        const broadcastPayload = {
          _id: newMessage._id,
          sender: senderIdentity,
          content: content,
          timestamp: newMessage.timestamp,
          classroomId: classroomId || null,
        };

        // Scoped broadcast: only to authorized members of the target room
        if (targetRoom) {
          socket.to(targetRoom).emit("receiveMessage", broadcastPayload);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      if (socket.joinedClassrooms) {
        socket.joinedClassrooms.clear();
      }
    });
  });
};

module.exports = socketService;
