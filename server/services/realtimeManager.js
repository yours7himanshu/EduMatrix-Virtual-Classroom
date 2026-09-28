/*
 * EduMatrix Cloudflare Workers Realtime Room & WebSocket Manager (Phase 7)
 * 
 * Re-architects stateful Socket.IO and raw port-8080 WebSocket servers
 * for Cloudflare Workers Free V8 isolates using native WebSocketPair.
 * 
 * Features:
 * 1. Strict server-side JWT authentication via query, header, or cookie
 * 2. Institutional boundary & classroom role authorization
 * 3. In-isolate room tracking (inst_<id>, class_<id>, user_<id>)
 * 4. Message persistence to MongoDB (Message model)
 * 5. Sanitized quiz broadcast (suppresses correctAnswer, isolates by institution)
 * 6. Rate-limiting (10 msgs / 5s per socket)
 * 7. Dual protocol framing: Native WebSockets + Socket.IO v4 engine.io compatibility
 */

const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");
const Classroom = require("../models/classroomModel");
const Enrollment = require("../models/enrollmentModel");
const LiveSession = require("../models/liveSessionModel");

let livekitSdk = null;
try {
  livekitSdk = require("livekit-server-sdk");
} catch {}

class RealtimeManager {
  constructor() {
    // Map<roomName, Set<WebSocketSession>>
    this.rooms = new Map();
    // Set<WebSocketSession>
    this.sessions = new Set();
    // Unique identifier for this isolate runtime
    this.isolateId = `isolate_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    // Circular buffer of recent quiz events to allow cross-isolate catch-up
    this.recentQuizEvents = [];
    // Pluggable cross-isolate coordinator (e.g. distributed pub/sub or test mock)
    this.customCoordinator = null;
  }

  setCoordinator(coordinator) {
    this.customCoordinator = coordinator;
  }

  getJwtSecret(env) {
    return (env && env.JWT_SECRET) || process.env.JWT_SECRET || "default_jwt_secret";
  }

  parseCookies(cookieStr) {
    if (!cookieStr || typeof cookieStr !== "string") return {};
    return cookieStr.split(";").reduce((acc, part) => {
      const idx = part.indexOf("=");
      if (idx > -1) {
        const key = part.slice(0, idx).trim().toLowerCase();
        const val = part.slice(idx + 1).trim();
        acc[key] = val;
      }
      return acc;
    }, {});
  }

  extractToken(url, headers) {
    // 1. Check query param: ?token=...
    if (url) {
      try {
        const parsed = new URL(url, "http://localhost");
        const token = parsed.searchParams.get("token");
        if (token && token !== "null" && token !== "undefined") return token;
      } catch {
        const match = url.match(/[?&]token=([^&]+)/);
        if (match) return decodeURIComponent(match[1]);
      }
    }

    // 2. Check Authorization header
    if (headers) {
      const authHeader = headers.get ? headers.get("authorization") : headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
      }
      const tokenHeader = headers.get ? headers.get("token") : headers.token;
      if (tokenHeader && tokenHeader !== "null" && tokenHeader !== "undefined") {
        return tokenHeader;
      }
      const cookieHeader = headers.get ? headers.get("cookie") : headers.cookie;
      if (cookieHeader) {
        const cookies = this.parseCookies(cookieHeader);
        if (cookies.token) return cookies.token;
        if (cookies.jwt) return cookies.jwt;
      }
    }

    return null;
  }

  authenticate(token, secret) {
    if (!token) throw new Error("Authentication error: Token required");
    const decoded = jwt.verify(token, secret);
    const userId = (decoded.userId || decoded.collegeId || decoded.id || "").toString();
    if (!userId) throw new Error("Authentication error: Invalid token payload");

    return {
      id: userId,
      email: decoded.email,
      role: decoded.role || "student",
      name: decoded.name || decoded.role || "Student",
      institutionId: decoded.institutionId ? decoded.institutionId.toString() : null,
    };
  }

  joinRoom(session, roomName) {
    if (!roomName) return;
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(session);
    session.rooms.add(roomName);
  }

  leaveRoom(session, roomName) {
    if (!roomName) return;
    const room = this.rooms.get(roomName);
    if (room) {
      room.delete(session);
      if (room.size === 0) {
        this.rooms.delete(roomName);
      }
    }
    session.rooms.delete(roomName);
  }

  broadcast(roomName, event, payload, excludeSession = null) {
    const room = this.rooms.get(roomName);
    let localDeliveredCount = 0;
    if (room) {
      for (const session of room) {
        if (session === excludeSession) continue;
        this.sendEvent(session, event, payload);
        localDeliveredCount++;
      }
    }

    // Cross-isolate LiveKit Data Channel dispatch for active live classrooms
    if (roomName && roomName.startsWith("class_")) {
      this._dispatchLiveKitClassroomData(roomName, event, payload).catch((err) => {
        // Log without crashing the worker isolate
        console.error("LiveKit Data Channel cross-isolate dispatch failed:", err.message);
      });
    }

    // Pluggable cross-isolate coordinator (e.g. distributed pub/sub or test mock)
    if (this.customCoordinator && typeof this.customCoordinator.broadcast === "function") {
      this.customCoordinator.broadcast(roomName, event, payload, excludeSession).catch((err) => {
        console.error("Custom coordinator broadcast failed:", err.message);
      });
    }

    return {
      deliveredLocally: localDeliveredCount,
      crossIsolateDispatched: true,
      roomName,
    };
  }

  async _dispatchLiveKitClassroomData(roomName, event, payload) {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl || !livekitSdk?.RoomServiceClient) {
      return false;
    }

    try {
      const roomService = new livekitSdk.RoomServiceClient(livekitUrl, apiKey, apiSecret);
      const dataPacket = Buffer.from(JSON.stringify({ event, data: payload }));

      // Deliver to class_<id> room and any active LiveSession room
      const targetRooms = new Set([roomName]);
      const classroomId = roomName && roomName.startsWith("class_") ? roomName.replace("class_", "") : null;
      if (classroomId && /^[0-9a-fA-F]{24}$/.test(classroomId)) {
        try {
          const activeSession = await LiveSession.findOne({ classroomId, status: "active" });
          if (activeSession && activeSession.roomName) {
            targetRooms.add(activeSession.roomName);
          }
        } catch {
          // If DB query fails or is offline, proceed with target roomName
        }
      }

      for (const target of targetRooms) {
        try {
          await roomService.sendData(target, dataPacket, 1 /* RELIABLE */);
        } catch (dispatchErr) {
          // Log individual room dispatch error without aborting other targets
          console.warn(`LiveKit dispatch to ${target} failed:`, dispatchErr.message);
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  sendEvent(session, event, payload) {
    if (!session || !session.ws) return;
    try {
      if (session.protocol === "socketio") {
        // Socket.IO event frame: 42["event", payload]
        session.ws.send(`42${JSON.stringify([event, payload])}`);
      } else {
        // Native WebSocket JSON frame: { event, data: payload }
        session.ws.send(JSON.stringify({ event, data: payload }));
      }
    } catch (err) {
      console.error("Error sending WebSocket message to session:", err.message);
    }
  }

  sendError(session, errorEvent, message) {
    if (!session || !session.ws) return;
    try {
      if (session.protocol === "socketio") {
        session.ws.send(`42${JSON.stringify([errorEvent, { error: message }])}`);
      } else {
        session.ws.send(JSON.stringify({ event: errorEvent, error: message }));
      }
    } catch {
      // Ignored if socket closed
    }
  }

  async handleJoinClassroom(session, classroomId) {
    try {
      if (!session.user) {
        this.sendError(session, "roomError", "Authentication required");
        return { success: false, error: "Authentication required" };
      }

      if (!classroomId || !/^[0-9a-fA-F]{24}$/.test(classroomId)) {
        this.sendError(session, "roomError", "Invalid classroom ID format");
        return { success: false, error: "Invalid classroom ID format" };
      }

      const classroom = await Classroom.findById(classroomId);
      if (!classroom || classroom.isActive === false) {
        this.sendError(session, "roomError", "Classroom not found or inactive");
        return { success: false, error: "Classroom not found or inactive" };
      }

      // Institutional boundary check
      const classInstId = classroom.institutionId ? classroom.institutionId.toString() : null;
      if (!session.user.institutionId || session.user.institutionId !== classInstId) {
        this.sendError(session, "roomError", "Access denied: Institutional boundary violation");
        return { success: false, error: "Access denied: Institutional boundary violation" };
      }

      // Role & Membership check
      const role = session.user.role;
      let isAuthorized = false;

      if (role === "Director" || role === "Registrar" || role === "admin") {
        isAuthorized = true;
      } else if (role === "Teacher" || role === "teacher") {
        const teacherId = classroom.teacherId ? classroom.teacherId.toString() : null;
        isAuthorized = (teacherId === session.user.id);
      } else if (role === "student" || role === "Student") {
        const enrollment = await Enrollment.findOne({
          classroomId: classroom._id,
          studentId: session.user.id,
          status: "enrolled",
        });
        isAuthorized = !!enrollment;
      }

      if (!isAuthorized) {
        this.sendError(session, "roomError", "Access denied: Unauthorized role or not enrolled in classroom");
        return { success: false, error: "Access denied: Unauthorized role or not enrolled in classroom" };
      }

      const roomName = `class_${classroomId}`;
      this.joinRoom(session, roomName);
      session.joinedClassrooms.add(classroomId.toString());

      this.sendEvent(session, "classroomJoined", { classroomId });
      return { success: true, classroomId };
    } catch (err) {
      console.error("Error joining classroom in realtime manager:", err);
      this.sendError(session, "roomError", "Internal server error during room join");
      return { success: false, error: "Internal server error" };
    }
  }

  handleLeaveClassroom(session, classroomId) {
    if (classroomId) {
      const roomName = `class_${classroomId}`;
      this.leaveRoom(session, roomName);
      session.joinedClassrooms.delete(classroomId.toString());
      this.sendEvent(session, "classroomLeft", { classroomId });
    }
  }

  async handleSendMessage(session, data) {
    try {
      if (!session.user) {
        this.sendError(session, "messageError", "Authentication failed. No valid token provided.");
        return;
      }

      const messageObj = typeof data === "string" ? JSON.parse(data) : data;
      if (!messageObj || typeof messageObj !== "object") {
        this.sendError(session, "messageError", "Invalid message payload");
        return;
      }

      const content = typeof messageObj.content === "string" ? messageObj.content.trim() : "";
      if (!content || content.length === 0) {
        this.sendError(session, "messageError", "Message content cannot be empty");
        return;
      }
      if (content.length > 5000) {
        this.sendError(session, "messageError", "Message exceeds maximum allowed length");
        return;
      }

      // Sliding rate limit: max 10 messages in 5 seconds
      const now = Date.now();
      while (session.messageTimestamps.length > 0 && now - session.messageTimestamps[0] > 5000) {
        session.messageTimestamps.shift();
      }
      if (session.messageTimestamps.length >= 10) {
        this.sendError(session, "messageError", "Rate limit exceeded. Please wait before sending more messages.");
        return;
      }
      session.messageTimestamps.push(now);

      let targetRoom = null;
      const classroomId = messageObj.classroomId;

      if (classroomId) {
        if (!/^[0-9a-fA-F]{24}$/.test(classroomId)) {
          this.sendError(session, "messageError", "Invalid classroom identifier");
          return;
        }
        const roomName = `class_${classroomId}`;
        if (!session.rooms.has(roomName)) {
          this.sendError(session, "messageError", "Unauthorized: You have not joined this classroom");
          return;
        }
        targetRoom = roomName;
      } else {
        if (session.user.institutionId) {
          targetRoom = `inst_${session.user.institutionId}`;
        } else {
          targetRoom = `user_${session.user.id}`;
        }
      }

      const senderIdentity = session.user.name || session.user.role || "Student";

      // Save to database
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
        nonce: messageObj.nonce || null,
      };

      // Broadcast to room excluding the sender (sender already renders locally)
      if (targetRoom) {
        this.broadcast(targetRoom, "receiveMessage", broadcastPayload, session);
      }
    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      this.sendError(session, "messageError", "Failed to send message");
    }
  }

  broadcastQuiz(quiz) {
    if (!quiz) return;
    const quizInstId = quiz.institutionId ? quiz.institutionId.toString() : null;
    if (!quizInstId) {
      console.warn("broadcastQuiz: quiz missing institutionId — broadcast suppressed to prevent global leak.");
      return;
    }

    const safePayload = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      institutionId: quizInstId,
      questions: Array.isArray(quiz.questions)
        ? quiz.questions.map((q) => ({
            _id: q._id,
            questionText: q.questionText,
            options: Array.isArray(q.options) ? q.options : [],
          }))
        : [],
    };

    // Record in circular buffer for cross-isolate catch-up
    this.recordQuizEvent({
      _id: String(quiz._id),
      title: quiz.title,
      description: quiz.description,
      institutionId: quizInstId,
      timestamp: Date.now(),
    });

    const targetRoom = `inst_${quizInstId}`;
    return this.broadcast(targetRoom, "new-quiz", safePayload);
  }

  recordQuizEvent(eventRecord) {
    this.recentQuizEvents.push(eventRecord);
    if (this.recentQuizEvents.length > 50) {
      this.recentQuizEvents.shift();
    }
  }

  getRecentQuizEvents(institutionId, sinceTimestamp = 0) {
    return this.recentQuizEvents.filter((ev) => {
      const matchInst = !institutionId || ev.institutionId === institutionId;
      const matchTime = !sinceTimestamp || ev.timestamp > sinceTimestamp;
      return matchInst && matchTime;
    });
  }

  getCoordinationStatus() {
    return {
      tier: "cloudflare-workers-free",
      isolateId: this.isolateId,
      activeSessions: this.sessions.size,
      activeRooms: this.rooms.size,
      crossIsolateStrategies: {
        inCallChat: "LiveKit WebRTC Data Channels (global mesh bypasses edge isolates)",
        outOfCallQuiz: "MongoDB persistent store + catch-up sync (GET /api/quizzes)",
      },
      hasCustomCoordinator: Boolean(this.customCoordinator),
    };
  }

  cleanupSession(session) {
    for (const roomName of session.rooms) {
      const room = this.rooms.get(roomName);
      if (room) {
        room.delete(session);
        if (room.size === 0) {
          this.rooms.delete(roomName);
        }
      }
    }
    session.rooms.clear();
    session.joinedClassrooms.clear();
    this.sessions.delete(session);
  }

  /**
   * Initializes a WebSocket connection inside Cloudflare Workers or Node.
   */
  handleWebSocket(ws, { url, headers, env, protocol = "native" }) {
    const token = this.extractToken(url, headers);
    const secret = this.getJwtSecret(env);

    let user;
    try {
      user = this.authenticate(token, secret);
    } catch (err) {
      try {
        if (protocol === "socketio") {
          ws.send(`44"Authentication error: ${err.message}"`);
        } else {
          ws.send(JSON.stringify({ error: err.message }));
        }
        ws.close(1008, "Authentication failed");
      } catch {}
      return null;
    }

    const session = {
      ws,
      user,
      rooms: new Set(),
      joinedClassrooms: new Set(),
      protocol,
      messageTimestamps: [],
    };

    this.sessions.add(session);

    // Auto-join institutional room and user private room
    if (user.institutionId) {
      this.joinRoom(session, `inst_${user.institutionId}`);
    }
    if (user.id) {
      this.joinRoom(session, `user_${user.id}`);
    }

    // If socket.io protocol, complete handshake frames
    if (protocol === "socketio") {
      try {
        // Socket.IO connect ACK: 40{"sid":"..."}
        ws.send(`40${JSON.stringify({ sid: `ws_${user.id}_${Date.now()}` })}`);
      } catch {}
    } else {
      try {
        ws.send(JSON.stringify({ event: "connected", user: { id: user.id, name: user.name, role: user.role } }));
      } catch {}
    }

    // Attach event listeners
    const onMessage = async (msgData) => {
      const text = typeof msgData === "string" ? msgData : (msgData.data || String(msgData));

      // Socket.IO protocol handling
      if (protocol === "socketio") {
        if (text === "2probe") {
          ws.send("3probe");
          return;
        }
        if (text === "2") {
          ws.send("3"); // Ping-pong
          return;
        }
        if (text === "5") {
          return; // Upgrade confirmation
        }
        if (text.startsWith("42")) {
          // Event: 42["eventName", payload]
          try {
            const parsed = JSON.parse(text.slice(2));
            const eventName = parsed[0];
            const eventPayload = parsed[1];

            if (eventName === "joinClassroom" || eventName === "joinRoom") {
              await this.handleJoinClassroom(session, eventPayload);
            } else if (eventName === "leaveClassroom" || eventName === "leaveRoom") {
              this.handleLeaveClassroom(session, eventPayload);
            } else if (eventName === "sendMessage") {
              await this.handleSendMessage(session, eventPayload);
            }
          } catch (e) {
            console.error("Failed to parse Socket.IO event:", e);
          }
        }
        return;
      }

      // Native WebSocket handling
      try {
        const parsed = JSON.parse(text);
        const eventName = parsed.event || parsed.type;
        const eventData = parsed.data || parsed.payload || parsed;

        if (eventName === "joinClassroom" || eventName === "joinRoom") {
          await this.handleJoinClassroom(session, eventData.classroomId || eventData);
        } else if (eventName === "leaveClassroom" || eventName === "leaveRoom") {
          this.handleLeaveClassroom(session, eventData.classroomId || eventData);
        } else if (eventName === "sendMessage") {
          await this.handleSendMessage(session, eventData);
        }
      } catch (e) {
        console.error("Failed to parse native WebSocket event:", e);
      }
    };

    const onClose = () => {
      this.cleanupSession(session);
    };

    if (typeof ws.addEventListener === "function") {
      ws.addEventListener("message", onMessage);
      ws.addEventListener("close", onClose);
      ws.addEventListener("error", onClose);
    } else if (typeof ws.on === "function") {
      ws.on("message", (data) => onMessage(data.toString()));
      ws.on("close", onClose);
      ws.on("error", onClose);
    }

    return session;
  }
}

const realtimeManager = new RealtimeManager();

module.exports = realtimeManager;
module.exports.RealtimeManager = RealtimeManager;
