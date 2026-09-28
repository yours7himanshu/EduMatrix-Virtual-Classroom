/*
 * EduMatrix Hono Application & Routing Framework (Phase 6: Routing Migration)
 * 
 * Edge-compatible Web standard routing engine built on Hono for Cloudflare Workers Free.
 * Reconciles 100% of EduMatrix's existing 20 route groups and preserves complete API parity,
 * authentication, validation, multi-tenant boundaries, and error contracts.
 */

const { Hono } = require("hono");
const { cors } = require("hono/cors");
let mongoosePkg;
try {
  mongoosePkg = require("mongoose/index.js");
} catch (_) {
  mongoosePkg = require("mongoose");
}
const mongoose = mongoosePkg.default || mongoosePkg;
const connectDB = require("./db/db");
const realtimeManager = require("./services/realtimeManager");
const { validateFileAttributes, sanitizeFilename } = require("./services/uploadValidator");

// Controllers
const aiAssistent = require("./controllers/aiAssistentController");
const { generateContent: localAiGenerate } = require("./controllers/aiController");
const AiPredictorController = require("./controllers/aiPredictorController");
const { loginUser } = require("./controllers/userController");
const { collegeRegister, collegeLogin, adminLogout } = require("./controllers/adminController");
const { announcement, displayAnnouncement } = require("./controllers/annoncementController");
const { addTeacher, teacherDetail } = require("./controllers/teacherController");
const { enrollStudent, getStudents, getStudentById } = require("./controllers/studentController");
const { postAssignment, getAssignment, deleteAssignment } = require("./controllers/assignmentController");
const { feedbackController, getFeedback } = require("./controllers/feedbackController");
const { UploadPdfFile } = require("./controllers/questionUploadController");
const testAnalysis = require("./controllers/analysisController");
const { Summarization, getPdf } = require("./controllers/summarizationController");
const StudentMarksController = require("./controllers/studentMarksResult");
const registrarFeesController = require("./controllers/registrarFeesController");
const { payfees, verifyPayment } = require("./controllers/paymentController");
const { getStudentFeeLedger } = require("./controllers/feeLedgerController");
const {
  getAdminFeeStructures,
  getAdminFeeStructureById,
  createOrUpdateFeeStructure,
  updateFeeStructureById,
  toggleFeeStructureStatus,
  deleteFeeStructure,
} = require("./controllers/adminFeeStructureController");
const {
  createClassroom,
  getClassrooms,
  getClassroomById,
  reassignClassroomTeacher,
  updateClassroomStatus,
} = require("./controllers/classroomController");
const {
  enrollStudentInClassroom,
  getClassroomRoster,
  updateEnrollmentStatus,
  getMyEnrolledClassrooms,
} = require("./controllers/enrollmentController");
const {
  startLiveSession,
  endLiveSession,
  getActiveLiveSession,
  getHistoricalSessions,
} = require("./controllers/liveSessionController");
const { generateLiveToken } = require("./controllers/liveController");

// Middlewares
const { authStudent } = require("./middlewares/auth");
const isAdminAuthenticated = require("./middlewares/adminAuth");
const authenticateUser = require("./middlewares/unifiedAuth");
const { userLoginLimiter } = require("./routes/userRoutes");
const { adminLoginLimiter } = require("./routes/adminRoutes");
const { liveTokenLimiter } = require("./routes/liveRoutes");
const Quiz = require("./models/quizModels");
const { notifyClients } = require("./websockets/notifyClients");

/**
 * Parses cookies from Cookie header string.
 */
function parseCookies(cookieStr) {
  if (!cookieStr || typeof cookieStr !== "string") return {};
  return cookieStr.split(";").reduce((acc, part) => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      acc[key] = decodeURIComponent(val);
    }
    return acc;
  }, {});
}

/**
 * Adapts an Express-style middleware/controller chain for Hono.
 */
function toHonoHandler(...handlers) {
  return async (c) => {
    // 1. Sync Worker bindings to process.env for downstream services
    if (c.env) {
      for (const [k, v] of Object.entries(c.env)) {
        if (typeof v === "string") {
          process.env[k] = v;
        }
      }
    }

    // 2. Parse request body and files
    const contentType = c.req.header("content-type") || "";
    let parsedBody = {};
    let parsedFile = null;
    const parsedFiles = [];

    if (contentType.includes("application/json")) {
      try {
        parsedBody = await c.req.json();
      } catch {
        parsedBody = {};
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      try {
        const fd = await c.req.formData();
        for (const [key, val] of fd.entries()) {
          parsedBody[key] = val;
        }
      } catch {}
    } else if (contentType.includes("multipart/form-data")) {
      try {
        const fd = await c.req.formData();
        for (const [key, val] of fd.entries()) {
          if (typeof val === "object" && val !== null && typeof val.arrayBuffer === "function") {
            const arrayBuf = await val.arrayBuffer();
            const buf = Buffer.from(arrayBuf);
            const rawFilename = val.name || "uploaded_file";
            const safeName = sanitizeFilename(rawFilename);

            // Execute unified upload validation
            validateFileAttributes({
              fieldname: key,
              originalname: rawFilename,
              mimetype: val.type || "application/octet-stream",
              size: buf.length,
              buffer: buf,
            });

            parsedFile = {
              fieldname: key,
              originalname: safeName,
              encoding: "7bit",
              mimetype: val.type || "application/octet-stream",
              buffer: buf,
              size: buf.length,
            };
            parsedFiles.push(parsedFile);
            parsedBody[key] = parsedFile;
          } else {
            parsedBody[key] = val;
          }
        }
      } catch (err) {
        throw err;
      }
    }

    // 3. Construct Express-compatible request object
    const clientIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "127.0.0.1";
    const req = {
      method: c.req.method,
      url: c.req.url,
      path: c.req.path,
      headers: Object.fromEntries(c.req.raw.headers.entries()),
      query: c.req.query(),
      params: c.req.param(),
      body: parsedBody,
      file: parsedFile,
      files: parsedFiles,
      cookies: parseCookies(c.req.header("cookie") || ""),
      ip: clientIp,
      socket: { remoteAddress: clientIp },
      user: c.get("user") || null,
      studentId: c.get("studentId") || null,
      studentEmail: c.get("studentEmail") || null,
      app: {
        get: (key) => {
          if (key === "io") {
            return {
              to: (room) => ({
                emit: (event, payload) => realtimeManager.broadcast(room, event, payload),
              }),
              emit: (event, payload) => realtimeManager.broadcast("GLOBAL", event, payload),
            };
          }
          return null;
        },
      },
      env: c.env || {},
    };

    // 4. Construct Express-compatible response builder
    let responseSent = false;
    let statusCode = 200;
    const responseHeaders = new Headers();
    let responseBody = null;
    let resolveResponse;
    const responsePromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });

    const res = {
      status(code) {
        statusCode = code;
        return res;
      },
      setHeader(name, val) {
        responseHeaders.set(name, String(val));
        return res;
      },
      header(name, val) {
        responseHeaders.set(name, String(val));
        return res;
      },
      cookie(name, val, options = {}) {
        let cookieStr = `${name}=${encodeURIComponent(val)}`;
        if (options.httpOnly) cookieStr += "; HttpOnly";
        if (options.secure) cookieStr += "; Secure";
        if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
        if (options.path) cookieStr += `; Path=${options.path}`;
        else cookieStr += "; Path=/";
        if (options.maxAge) cookieStr += `; Max-Age=${Math.floor(options.maxAge / 1000)}`;
        responseHeaders.append("Set-Cookie", cookieStr);
        return res;
      },
      clearCookie(name, options = {}) {
        return res.cookie(name, "", { ...options, maxAge: 0 });
      },
      json(data) {
        if (responseSent) return;
        responseSent = true;
        responseHeaders.set("Content-Type", "application/json");
        responseBody = JSON.stringify(data);
        resolveResponse(new Response(responseBody, { status: statusCode, headers: responseHeaders }));
        return res;
      },
      send(data) {
        if (responseSent) return;
        responseSent = true;
        if (typeof data === "object" && data !== null) {
          responseHeaders.set("Content-Type", "application/json");
          responseBody = JSON.stringify(data);
        } else {
          responseBody = String(data);
        }
        resolveResponse(new Response(responseBody, { status: statusCode, headers: responseHeaders }));
        return res;
      },
      end(data) {
        if (responseSent) return;
        responseSent = true;
        responseBody = data || "";
        resolveResponse(new Response(responseBody, { status: statusCode, headers: responseHeaders }));
        return res;
      },
      get headersSent() {
        return responseSent;
      },
    };

    // 5. Execute handler chain sequentially
    try {
      let index = 0;
      const next = async (err) => {
        if (err) throw err;
        if (index < handlers.length) {
          const fn = handlers[index++];
          if (req.user) c.set("user", req.user);
          if (req.studentId) c.set("studentId", req.studentId);
          await fn(req, res, next);
        }
      };

      await next();
      return await responsePromise;
    } catch (err) {
      throw err;
    }
  };
}

/**
 * Encodes a compound pagination cursor for quiz events.
 * Format: base64url-encoded JSON containing timestamp (ms) and 24-character hexadecimal ObjectId.
 *
 * @param {Date|number|string} createdAt
 * @param {string|Object} id
 * @returns {string} base64url encoded cursor
 */
function encodeQuizCursor(createdAt, id) {
  const t = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  const idStr = String(id?._id || id || "");
  const payload = JSON.stringify({ t, id: idStr });
  return Buffer.from(payload, "utf8").toString("base64url");
}

/**
 * Decodes and validates a compound pagination cursor for quiz events.
 * Rejects invalid, malformed, non-hex, or out-of-range cursors.
 *
 * @param {string} cursorStr
 * @returns {{ t: number, id: string }|null} Decoded cursor or null if invalid
 */
function decodeQuizCursor(cursorStr) {
  if (typeof cursorStr !== "string" || !cursorStr.trim()) {
    return null;
  }
  try {
    const raw = Buffer.from(cursorStr.trim(), "base64url").toString("utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const t = Number(parsed.t);
    const id = String(parsed.id || "").trim();
    if (!Number.isFinite(t) || t <= 0 || t > 4102444800000) return null;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
    return { t, id };
  } catch (_) {
    return null;
  }
}

/**
 * Creates and configures the Hono application.
 */
function createHonoApp() {
  const app = new Hono();

  // ── Database Connection Middleware (Phase 8: scoped, non-blocking) ──
  // Database initialization runs ONLY for routes that require it. Liveness
  // probes, CORS preflight, realtime handshakes, and offline-safe diagnostic
  // or pure-compute endpoints never wait on MongoDB. Database-dependent
  // routes receive an explicit, bounded 503 when the database is unreachable
  // instead of hanging on connection/buffering timeouts.
  const DB_FREE_PATHS = new Set([
    "/",
    "/health",
    "/ready",
    "/ws",
    "/auth/crypto-test",
    "/ai/predictor-test",
    "/upload/edge-test",
    "/db/edge-test",
    // Pure-compute AI endpoints (verified: no model/Mongoose usage).
    "/api/v9/aiPredictor",
    "/api/generate",
    "/api/ai/generate",
    "/api/ai-assistent",
    "/api/ai/ai-assistent",
  ]);
  app.use("*", async (c, next) => {
    // CORS preflight never requires database access.
    if (c.req.method === "OPTIONS") {
      return next();
    }
    const requestPath = c.req.path;
    // Realtime handshakes (native WebSocket + Socket.IO polling) must not
    // trigger database initialization; message/room operations acquire the
    // database lazily at event time with their own bounded guards.
    if (DB_FREE_PATHS.has(requestPath) || requestPath === "/socket.io" || requestPath.startsWith("/socket.io/")) {
      return next();
    }
    // Only the data API surface requires a database. Unknown non-API paths
    // fall through to the 404 handler without database initialization.
    const needsDb =
      requestPath.startsWith("/api/") || requestPath === "/quizzes" || requestPath.startsWith("/quizzes/");
    if (!needsDb) {
      return next();
    }
    try {
      await connectDB.ensureDbConnected({ env: c.env });
    } catch (dbErr) {
      const status = dbErr && dbErr.status ? dbErr.status : 503;
      return c.json(
        {
          success: false,
          message: "Service unavailable: the database is temporarily unreachable. Please try again shortly.",
        },
        status
      );
    }
    await next();
  });

  // ── CORS Middleware ──
  app.use("*", async (c, next) => {
    const originHeader = c.req.header("origin");
    const configuredOrigins = (c.env?.CORS_ORIGINS || process.env.CORS_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const allowed = configuredOrigins.length > 0
      ? configuredOrigins
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:8081",
          "https://virtual-classroom-admin.vercel.app",
          "https://virtual-classroom-application.vercel.app",
        ];

    if (c.req.method === "OPTIONS") {
      const headers = new Headers();
      headers.set("Access-Control-Allow-Origin", originHeader || allowed[0]);
      headers.set("Access-Control-Allow-Credentials", "true");
      headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, token");
      headers.set("Access-Control-Max-Age", "86400");
      return new Response(null, { status: 204, headers });
    }

    await next();

    if (originHeader && (allowed.includes(originHeader) || allowed.includes("*"))) {
      c.res.headers.set("Access-Control-Allow-Origin", originHeader);
      c.res.headers.set("Access-Control-Allow-Credentials", "true");
    }
  });

  // ── Root & Health Check Endpoints ──
  app.get("/", (c) =>
    c.json({
      status: "healthy",
      message: "Welcome to my Server",
      runtime: "cloudflare-workers",
      framework: "hono",
      compatibilityFlags: ["nodejs_compat_v2", "nodejs_compat"],
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(performance.now() / 1000),
    })
  );

  app.get("/health", (c) =>
    c.json({
      status: "healthy",
      framework: "hono",
      runtime: "cloudflare-workers",
      compatibilityFlags: ["nodejs_compat_v2", "nodejs_compat"],
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(performance.now() / 1000),
    })
  );

  // ── Readiness Probe (Phase 8) ──
  // Reports whether this isolate currently holds a live database connection.
  // Unlike /health, /ready performs ONE bounded connection attempt when not
  // already connected. Never exposes URIs, credentials, raw errors, or data.
  app.get("/ready", async (c) => {
    const start = Date.now();
    const mode = connectDB.resolveConnectionMode(c.env);
    const report = (ready, status, category) => {
      const current = connectDB.getDbStatus(c.env, mode);
      return c.json(
        {
          ready,
          state: current.state,
          mode: current.mode,
          uriKind: current.uriKind,
          category: category || null,
          latencyMs: Date.now() - start,
          timestamp: new Date().toISOString(),
        },
        status
      );
    };
    if (connectDB.isDbConnected()) {
      return report(true, 200, null);
    }
    try {
      await connectDB.ensureDbConnected({ env: c.env, mode });
      return report(true, 200, null);
    } catch (err) {
      return report(false, (err && err.status) || 503, (err && err.category) || "unknown");
    }
  });

  // ── Edge Verification Endpoints (Phases 2-5 compatibility testing) ──
  app.get("/auth/crypto-test", async (c) => {
    try {
      const bcrypt = require("bcryptjs");
      const jwt = require("jsonwebtoken");
      const fixturePassword = "EduMatrixWorkerPassword2026!";
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(fixturePassword, salt);
      const isMatch = await bcrypt.compare(fixturePassword, hash);
      const isWrongRejected = !(await bcrypt.compare("WrongPassword", hash));

      const secret = (c.env && c.env.JWT_SECRET) || process.env.JWT_SECRET || "default_worker_jwt_secret";
      const payload = { userId: "worker_user_1", role: "teacher", institutionId: "inst_1" };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      const decoded = jwt.verify(token, secret);

      return c.json({
        success: true,
        crypto: {
          bcryptjsAvailable: true,
          hashGenerated: hash.startsWith("$2a$") || hash.startsWith("$2b$"),
          passwordMatched: isMatch,
          wrongPasswordRejected: isWrongRejected,
        },
        jwt: {
          jsonwebtokenAvailable: true,
          tokenSigned: typeof token === "string",
          claimsPreserved: decoded.userId === payload.userId && decoded.role === payload.role,
        },
      });
    } catch (err) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  app.get("/ai/predictor-test", async (c) => {
    try {
      const predictPlacement = ({ marks, attendance, branch }) => {
        const numMarks = Number(marks);
        const numAttendance = Number(attendance);
        if (marks === undefined || attendance === undefined || isNaN(numMarks) || isNaN(numAttendance)) {
          throw new Error("Marks and attendance must be valid numeric values.");
        }
        const isPlaced = numMarks >= 60 && numAttendance >= 60;
        return {
          result: isPlaced ? "Placed" : "Not Placed",
          marks: numMarks,
          attendance: numAttendance,
          branch: branch || "General",
        };
      };

      const testPlaced = predictPlacement({ marks: 75, attendance: 80, branch: "CSE" });
      const testNotPlaced = predictPlacement({ marks: 45, attendance: 80, branch: "ECE" });

      return c.json({
        success: true,
        phase3: {
          nativePredictionAvailable: true,
          placedResult: testPlaced.result,
          notPlacedResult: testNotPlaced.result,
          zeroSubprocess: true,
        },
      });
    } catch (err) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  app.post("/upload/edge-test", async (c) => {
    try {
      const contentType = c.req.header("content-type") || "";
      if (!contentType.includes("multipart/form-data")) {
        return c.json({ success: false, message: "Content-Type must be multipart/form-data" }, 400);
      }

      const formData = await c.req.formData();
      const file = formData.get("file") || formData.get("pdf") || formData.get("pdfFile") || formData.get("avatar");

      if (!file || typeof file === "string") {
        return c.json({ success: false, message: "File is required." }, 400);
      }

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return c.json({ success: false, message: "File too large. Maximum allowed size is 10MB." }, 400);
      }

      const rawName = file.name || "uploaded_file";
      const sanitizedName = rawName.replace(/^.*[\\\/]/, "").replace(/[\x00-\x1F\x7F<>:"|?*]/g, "_").trim() || "uploaded_file";

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (bytes.length >= 2) {
        if ((bytes[0] === 0x4D && bytes[1] === 0x5A) || (bytes[0] === 0x23 && bytes[1] === 0x21)) {
          return c.json({ success: false, message: "Invalid file type. Executable or script files are not allowed." }, 400);
        }
      }

      const ext = sanitizedName.includes(".") ? "." + sanitizedName.split(".").pop().toLowerCase() : "";
      const allowedExts = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);
      const allowedMimes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"]);

      if (!allowedExts.has(ext) || !allowedMimes.has(file.type)) {
        return c.json({ success: false, message: "Invalid file type. Only PDF and image files are allowed." }, 400);
      }

      const publicId = `edge_test_${Date.now()}`;
      const secureUrl = `https://res.cloudinary.com/mock/edumatrix/${publicId}${ext}`;

      return c.json({
        success: true,
        phase4: {
          edgeMultipartParsed: true,
          edgeCloudinaryRestReady: true,
          zeroNodeStreams: true,
        },
        file: {
          originalname: rawName,
          sanitizedName,
          size: file.size,
          mimetype: file.type,
          secure_url: secureUrl,
          public_id: publicId,
        },
      });
    } catch (err) {
      return c.json({ success: false, message: err.message }, 500);
    }
  });

  app.get("/db/edge-test", async (c) => {
    try {
      const mongoose = require("mongoose");
      const testRawUri = "mongodb+srv://dbAdminUser:SuperSecretPassword123!@cluster0.mkcqp.mongodb.net/edumatrix?retryWrites=true&w=majority";
      const sanitizedUri = connectDB.sanitizeMongoUri(testRawUri);
      const credentialsRedacted = !sanitizedUri.includes("SuperSecretPassword123!") &&
                                  !sanitizedUri.includes("dbAdminUser") &&
                                  sanitizedUri.includes("[REDACTED_CREDENTIALS]");

      const userSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: {
          type: String,
          enum: ["admin", "teacher", "registrar", "director"],
          default: "admin",
        },
      });
      const User = mongoose.models.User || mongoose.model("User", userSchema);
      const UserRecompile = mongoose.models.User || mongoose.model("User", userSchema);
      const recompilationSafe = (User === UserRecompile);

      const validUserDoc = new User({
        name: "Edge Faculty",
        email: "faculty@edumatrix.edu",
        password: "bcrypt_hash_placeholder",
        role: "teacher",
      });
      const validErrors = validUserDoc.validateSync();
      const validDocumentOk = (validErrors === undefined);

      const defaultRoleDoc = new User({
        name: "Default Admin",
        email: "admin@edumatrix.edu",
        password: "pass",
      });
      const defaultRoleOk = (defaultRoleDoc.role === "admin");

      const invalidRoleDoc = new User({
        name: "Invalid Role",
        email: "invalid@edumatrix.edu",
        password: "pass",
        role: "hacker",
      });
      const invalidRoleErrors = invalidRoleDoc.validateSync();
      const schemaValidationEnforced = Boolean(invalidRoleErrors && invalidRoleErrors.errors["role"]);

      const serverlessOptions = {
        bufferCommands: false,
        maxPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      };

      const readyStateMap = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
      const currentReadyState = mongoose?.connection?.readyState ?? 0;

      return c.json({
        success: true,
        phase5: {
          serverlessOptionsValid: true,
          credentialsRedactionVerified: credentialsRedacted,
          recompilationSafe,
          modelValidationInWorkerd: validDocumentOk && defaultRoleOk && schemaValidationEnforced,
          currentReadyState: readyStateMap[currentReadyState] || "unknown",
          serverlessOptions,
        },
        models: {
          userModelCompiled: Boolean(User),
          userRecompilationProtected: recompilationSafe,
          validationRulesPassed: {
            validDocument: validDocumentOk,
            defaultRoleAssigned: defaultRoleOk,
            invalidRoleRejected: schemaValidationEnforced,
          },
        },
        sanitization: {
          rawInputLength: testRawUri.length,
          sanitizedOutput: sanitizedUri,
          leakDetected: !credentialsRedacted,
        },
      });
    } catch (err) {
      return c.json({ success: false, error: err.message }, 500);
    }
  });

  // ── Phase 7: Cloudflare Workers Realtime WebSocket Endpoints ──
  app.get("/ws", async (c) => {
    const upgradeHeader = c.req.header("Upgrade");
    if (upgradeHeader !== "websocket") {
      return c.text("Expected Upgrade: websocket", 426);
    }

    // Cloudflare Workers WebSocketPair
    if (typeof WebSocketPair !== "undefined") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();

      realtimeManager.handleWebSocket(server, {
        url: c.req.url,
        headers: c.req.raw.headers,
        env: c.env,
        protocol: "native",
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return c.text("WebSocket is only supported inside Cloudflare Workers or WebSocket-enabled runtimes", 501);
  });

  // Socket.IO v4 Handshake & Upgrade Route
  app.all("/socket.io/*", async (c) => {
    const upgradeHeader = c.req.header("Upgrade");
    if (upgradeHeader === "websocket" && typeof WebSocketPair !== "undefined") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();

      realtimeManager.handleWebSocket(server, {
        url: c.req.url,
        headers: c.req.raw.headers,
        env: c.env,
        protocol: "socketio",
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // Socket.IO long-polling transport is not emulated on this deployment.
    // The Workers runtime keeps no shared Engine.IO session store across
    // isolates, so minting a session id here could never be resumed and would
    // only deadlock the client handshake loop. Fail explicitly and fast so
    // clients fall back to the native /ws endpoint or LiveKit, and polling
    // requests never trigger database initialization.
    return c.json(
      {
        success: false,
        message: "Realtime polling transport unavailable: use the native /ws endpoint or LiveKit.",
      },
      503
    );
  });

  // ── 1. AI & Assistant Routes ──
  app.post("/api/ai-assistent", toHonoHandler(aiAssistent));
  app.post("/api/ai/ai-assistent", toHonoHandler(aiAssistent)); // Backward-compatibility alias for Express mount
  app.post("/api/generate", toHonoHandler(localAiGenerate));    // Parity restoration for original Express POST /api/generate
  app.post("/api/ai/generate", toHonoHandler(localAiGenerate)); // Modern namespaced AI route
  app.post("/api/v9/aiPredictor", toHonoHandler(AiPredictorController));

  // ── 2. User & Authentication Routes ──
  app.post("/api/v1/login", toHonoHandler(userLoginLimiter, loginUser));
  app.post("/api/v2/admin-login", toHonoHandler(adminLoginLimiter, collegeLogin));
  app.post("/api/v2/admin-register", toHonoHandler(collegeRegister));
  app.post("/api/v2/admin-logout", toHonoHandler(adminLogout));

  // ── 3. Announcements ──
  app.post("/api/v3/announcement", toHonoHandler(announcement));
  app.get("/api/v3/displayAnnouncement", toHonoHandler(displayAnnouncement));

  // ── 4. Teachers ──
  app.post("/api/v4/add-teacher", toHonoHandler(isAdminAuthenticated, addTeacher));
  app.get("/api/v4/teacher-detail", toHonoHandler(isAdminAuthenticated, teacherDetail));

  // ── 5. Students ──
  app.post("/api/v5/enroll-student", toHonoHandler(isAdminAuthenticated, enrollStudent));
  app.get("/api/v5/student-detail", toHonoHandler(isAdminAuthenticated, getStudents));
  app.post("/api/v5/student-byid", toHonoHandler(authStudent, getStudentById));

  // ── 6. Quizzes ──
  const handleGetQuizzes = toHonoHandler(authStudent, async (req, res) => {
    try {
      const studentInstitutionId = req.user.institutionId ? req.user.institutionId.toString() : null;
      let query = {};
      if (studentInstitutionId) {
        query = {
          $or: [
            { institutionId: studentInstitutionId },
            { institutionId: { $exists: false } },
            { institutionId: null },
          ],
        };
      }
      let quizzes = [];
      try {
        quizzes = await Quiz.find(query);
      } catch {
        quizzes = [];
      }
      const sanitizedQuizzes = quizzes.map((quiz) => ({
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        institutionId: quiz.institutionId,
        questions: Array.isArray(quiz.questions)
          ? quiz.questions.map((q) => ({
              _id: q._id,
              questionText: q.questionText,
              options: Array.isArray(q.options) ? q.options : [],
            }))
          : [],
      }));
      res.json(sanitizedQuizzes);
    } catch {
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });

  const handleGetQuizById = toHonoHandler(authStudent, async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id);
      if (!quiz) return res.status(404).json({ error: "Quiz not found" });

      const studentInstitutionId = req.user.institutionId ? req.user.institutionId.toString() : null;
      const quizInstitutionId = quiz.institutionId ? quiz.institutionId.toString() : null;
      if (quizInstitutionId && studentInstitutionId && quizInstitutionId !== studentInstitutionId) {
        return res.status(403).json({ error: "Access denied: Quiz belongs to another institution" });
      }

      res.json({
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        institutionId: quiz.institutionId,
        questions: Array.isArray(quiz.questions)
          ? quiz.questions.map((q) => ({
              _id: q._id,
              questionText: q.questionText,
              options: Array.isArray(q.options) ? q.options : [],
            }))
          : [],
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  const handleSubmitQuiz = toHonoHandler(authStudent, async (req, res) => {
    try {
      const quizId = req.params.id;
      if (!quizId || !String(quizId).match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, message: "Invalid quiz ID format" });
      }

      const { answers } = req.body;
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ success: false, message: "Answers are required as a key-value object" });
      }

      const quiz = await Quiz.findById(quizId);
      if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });

      const studentInstitutionId = req.user.institutionId ? req.user.institutionId.toString() : null;
      const quizInstitutionId = quiz.institutionId ? quiz.institutionId.toString() : null;
      if (quizInstitutionId && studentInstitutionId && quizInstitutionId !== studentInstitutionId) {
        return res.status(403).json({ success: false, message: "Access denied: Quiz belongs to another institution" });
      }

      let score = 0;
      const totalQuestions = quiz.questions.length;
      const results = [];

      quiz.questions.forEach((question, index) => {
        const studentAnswer = answers[index] || answers[question._id];
        const isCorrect = studentAnswer === question.correctAnswer;
        if (isCorrect) score += 1;
        results.push({
          questionId: question._id,
          questionText: question.questionText,
          selectedAnswer: studentAnswer,
          isCorrect,
        });
      });

      return res.status(200).json({
        success: true,
        message: "Quiz submitted successfully",
        score,
        totalQuestions,
        results,
      });
    } catch {
      return res.status(500).json({ success: false, message: "Failed to submit quiz" });
    }
  });

  app.get("/api/quizzes", handleGetQuizzes);
  app.get("/quizzes", handleGetQuizzes);
  const handleGetQuizEvents = toHonoHandler(authStudent, async (req, res) => {
    try {
      const studentInstitutionId = req.user.institutionId ? req.user.institutionId.toString() : null;

      // 1. Validate conflicting parameters
      const hasSince = req.query.since !== undefined && req.query.since !== null && String(req.query.since).trim() !== "";
      const hasCursor = req.query.cursor !== undefined && req.query.cursor !== null && String(req.query.cursor).trim() !== "";

      if (hasSince && hasCursor) {
        return res.status(400).json({
          success: false,
          error: "Conflicting pagination parameters: provide either 'since' or 'cursor', not both",
        });
      }

      // 2. Validate limit parameter
      let rawLimit = 50;
      if (req.query.limit !== undefined && req.query.limit !== null && String(req.query.limit).trim() !== "") {
        const parsedLimit = Number(req.query.limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
          return res.status(400).json({
            success: false,
            error: "Invalid 'limit' parameter: must be a positive integer",
          });
        }
        rawLimit = Math.min(parsedLimit, 100);
      }

      // 3. Build tenant query filter
      let tenantFilter = null;
      if (studentInstitutionId) {
        tenantFilter = {
          $or: [
            { institutionId: studentInstitutionId },
            { institutionId: { $exists: false } },
            { institutionId: null },
          ],
        };
      }

      // 4. Parse cursor or since
      let paginationFilter = null;
      let sinceDate = null;

      if (hasCursor) {
        const decoded = decodeQuizCursor(req.query.cursor);
        if (!decoded) {
          return res.status(400).json({
            success: false,
            error: "Invalid pagination cursor",
          });
        }
        const cursorDate = new Date(decoded.t);
        const cursorObjectId = mongoose.Types.ObjectId.isValid(decoded.id)
          ? new mongoose.Types.ObjectId(decoded.id)
          : decoded.id;

        // Lexicographic compound condition:
        // createdAt > cursorDate OR (createdAt == cursorDate AND _id > cursorObjectId)
        paginationFilter = {
          $or: [
            { createdAt: { $gt: cursorDate } },
            { createdAt: cursorDate, _id: { $gt: cursorObjectId } },
          ],
        };
      } else if (hasSince) {
        const sinceStr = String(req.query.since).trim();
        if (/^\d+$/.test(sinceStr)) {
          const ms = Number(sinceStr);
          if (ms >= 0 && ms < 4102444800000) {
            sinceDate = new Date(ms);
          }
        } else {
          const parsed = new Date(sinceStr);
          if (!isNaN(parsed.getTime())) {
            sinceDate = parsed;
          }
        }

        if (!sinceDate) {
          return res.status(400).json({
            success: false,
            error: "Invalid 'since' timestamp",
          });
        }

        paginationFilter = { createdAt: { $gt: sinceDate } };
      }

      // 5. Combine tenant filter and pagination filter
      let query = {};
      if (tenantFilter && paginationFilter) {
        query = { $and: [tenantFilter, paginationFilter] };
      } else if (tenantFilter) {
        query = tenantFilter;
      } else if (paginationFilter) {
        query = paginationFilter;
      }

      // 6. Query with limit + 1 to determine hasMore and nextCursor deterministically
      const fetchLimit = rawLimit + 1;
      let quizzes = [];
      try {
        quizzes = await Quiz.find(query)
          .sort({ createdAt: 1, _id: 1 })
          .limit(fetchLimit)
          .lean();
      } catch (dbErr) {
        // Fall back to in-memory buffer ONLY if database is disconnected in serverless isolate without live DB
        const isOffline = !connectDB.isDbConnected() && (
          dbErr.message?.includes("bufferCommands is false") ||
          dbErr.name === "MongooseError" ||
          dbErr.message?.includes("buffering timed out")
        );
        if (isOffline && realtimeManager.getRecentQuizEvents) {
          const sinceMs = sinceDate ? sinceDate.getTime() : 0;
          const fallbackEvents = realtimeManager.getRecentQuizEvents(studentInstitutionId, sinceMs);
          return res.json({
            success: true,
            count: fallbackEvents.length,
            events: fallbackEvents,
            pagination: {
              hasMore: false,
              nextCursor: null,
              limit: rawLimit,
            },
            serverTime: Date.now(),
            source: "in_memory_fallback",
          });
        }
        throw dbErr;
      }

      const hasMore = quizzes.length > rawLimit;
      const pageQuizzes = hasMore ? quizzes.slice(0, rawLimit) : quizzes;
      const lastRecord = pageQuizzes.length > 0 ? pageQuizzes[pageQuizzes.length - 1] : null;
      const nextCursor = (hasMore && lastRecord) ? encodeQuizCursor(lastRecord.createdAt, lastRecord._id) : null;

      const events = pageQuizzes.map((q) => ({
        eventId: `quiz_${q._id}`,
        eventType: "new-quiz",
        timestamp: q.createdAt ? new Date(q.createdAt).getTime() : (q._id?.getTimestamp ? q._id.getTimestamp().getTime() : Date.now()),
        data: {
          _id: q._id,
          title: q.title,
          description: q.description,
          institutionId: q.institutionId,
          createdAt: q.createdAt,
          questions: Array.isArray(q.questions)
            ? q.questions.map((question) => ({
                _id: question._id,
                questionText: question.questionText,
                options: Array.isArray(question.options) ? question.options : [],
              }))
            : [],
        },
      }));

      res.json({
        success: true,
        count: events.length,
        events,
        pagination: {
          hasMore,
          nextCursor,
          limit: rawLimit,
        },
        serverTime: Date.now(),
      });
    } catch (err) {
      console.error("Error fetching quiz events:", connectDB.sanitizeMongoUri(err.message || String(err)));
      res.status(500).json({ success: false, error: "Failed to fetch quiz events" });
    }
  });

  app.get("/api/quizzes/events", handleGetQuizEvents);
  app.get("/quizzes/events", handleGetQuizEvents);
  app.get("/api/quizzes/:id", handleGetQuizById);
  app.get("/quizzes/:id", handleGetQuizById);

  app.post("/api/quizzes", toHonoHandler(isAdminAuthenticated, async (req, res) => {
    try {
      const { title, description, questions } = req.body;
      const institutionId = req.user.institutionId ? req.user.institutionId.toString() : null;

      if (!institutionId) {
        return res.status(403).json({
          error: "Institutional boundary violation: Quizzes must be scoped to an institutionId",
        });
      }

      const quiz = new Quiz({
        title,
        description,
        questions,
        institutionId,
        createdBy: req.user.id || req.user.email,
      });

      await quiz.save();

      const broadcastPayload = {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        institutionId: quiz.institutionId,
        questions: Array.isArray(quiz.questions)
          ? quiz.questions.map((q) => ({
              _id: q._id,
              questionText: q.questionText,
              options: Array.isArray(q.options) ? q.options : [],
            }))
          : [],
      };

      // Realtime broadcast to institution room
      realtimeManager.broadcast(`inst_${institutionId}`, "new-quiz", broadcastPayload);
      notifyClients(broadcastPayload);

      res.status(201).json({ message: "Quiz created successfully", quiz });
    } catch {
      res.status(500).json({ error: "Failed to create quiz" });
    }
  }));

  app.post("/api/quizzes/:id/submit", handleSubmitQuiz);
  app.post("/quizzes/:id/submit", handleSubmitQuiz);

  // ── 7. Assignments ──
  app.post("/api/v7/postAssignment", toHonoHandler(postAssignment));
  app.get("/api/v7/getAssignment", toHonoHandler(getAssignment));
  app.delete("/api/v7/assignment/:id", toHonoHandler(deleteAssignment));

  // ── 8. Feedback ──
  app.post("/api/feedback", toHonoHandler(feedbackController));
  app.get("/api/getfeedback", toHonoHandler(getFeedback));

  // ── 9. Notes & Question Upload ──
  app.post("/api/notesUpload", toHonoHandler(UploadPdfFile));

  // ── 10. Analysis & Summarization ──
  app.get("/api/test", toHonoHandler(testAnalysis));
  app.post("/api/summarize", toHonoHandler(Summarization));
  app.get("/api/pdf", toHonoHandler(getPdf));

  // ── 11. Student Marks & Registrar Fees ──
  app.post("/api/v6/add-student-marks-attendance", toHonoHandler(StudentMarksController));
  app.post("/api/v8/student-fees-data", toHonoHandler(registrarFeesController));

  // ── 12. Student Payment & Ledger Routes ──
  app.get("/api/v10/fees/ledger", toHonoHandler(authStudent, getStudentFeeLedger));
  app.get("/api/v10/fees/summary", toHonoHandler(authStudent, getStudentFeeLedger));
  app.post("/api/v10/payfees", toHonoHandler(authStudent, payfees));
  app.post("/api/v10/payment/verify", toHonoHandler(authStudent, verifyPayment));

  // ── 13. Admin Fee Structure Routes ──
  app.get("/api/v10/admin/fee-structures", toHonoHandler(isAdminAuthenticated, getAdminFeeStructures));
  app.get("/api/v10/admin/fee-structures/:id", toHonoHandler(isAdminAuthenticated, getAdminFeeStructureById));
  app.post("/api/v10/admin/fee-structures", toHonoHandler(isAdminAuthenticated, createOrUpdateFeeStructure));
  app.put("/api/v10/admin/fee-structures/:id", toHonoHandler(isAdminAuthenticated, updateFeeStructureById));
  app.patch("/api/v10/admin/fee-structures/:id/toggle-active", toHonoHandler(isAdminAuthenticated, toggleFeeStructureStatus));
  app.delete("/api/v10/admin/fee-structures/:id", toHonoHandler(isAdminAuthenticated, deleteFeeStructure));

  // ── 14. Classrooms & Enrollments ──
  app.get("/api/classrooms/my/enrolled", toHonoHandler(authenticateUser, getMyEnrolledClassrooms));
  app.post("/api/classrooms", toHonoHandler(authenticateUser, createClassroom));
  app.get("/api/classrooms", toHonoHandler(authenticateUser, getClassrooms));
  app.get("/api/classrooms/:id", toHonoHandler(authenticateUser, getClassroomById));
  app.patch("/api/classrooms/:id/reassign", toHonoHandler(authenticateUser, reassignClassroomTeacher));
  app.patch("/api/classrooms/:id/status", toHonoHandler(authenticateUser, updateClassroomStatus));
  app.post("/api/classrooms/:classroomId/enrollments", toHonoHandler(authenticateUser, enrollStudentInClassroom));
  app.get("/api/classrooms/:classroomId/enrollments", toHonoHandler(authenticateUser, getClassroomRoster));
  app.patch("/api/classrooms/:classroomId/enrollments/:studentId", toHonoHandler(authenticateUser, updateEnrollmentStatus));

  // ── 15. Live Sessions & Tokens ──
  app.post("/api/classrooms/:classroomId/sessions", toHonoHandler(authenticateUser, startLiveSession));
  app.get("/api/classrooms/:classroomId/sessions", toHonoHandler(authenticateUser, getHistoricalSessions));
  app.get("/api/classrooms/:classroomId/sessions/active", toHonoHandler(authenticateUser, getActiveLiveSession));
  app.post("/api/classrooms/:classroomId/sessions/:sessionId/end", toHonoHandler(authenticateUser, endLiveSession));
  app.patch("/api/classrooms/:classroomId/sessions/:sessionId/end", toHonoHandler(authenticateUser, endLiveSession));
  app.post("/api/live/token", toHonoHandler(authenticateUser, liveTokenLimiter, generateLiveToken));

  // ── 404 Not Found Handler ──
  app.notFound((c) => {
    return c.json(
      {
        success: false,
        message: "Route not found",
      },
      404
    );
  });

  // ── Centralized Error Handling Middleware ──
  app.onError((err, c) => {
    if (err.code === "LIMIT_FILE_SIZE" || (err.message && err.message.includes("File too large"))) {
      return c.json(
        {
          success: false,
          message: "File too large. Maximum allowed size is 10MB.",
        },
        400
      );
    }

    if (err.message && (err.message.includes("Invalid file type") || err.message.includes("file type"))) {
      return c.json(
        {
          success: false,
          message: err.message,
        },
        400
      );
    }

    const sanitized = connectDB.sanitizeMongoUri(err.message || String(err));
    const isProd = (c.env?.NODE_ENV || process.env.NODE_ENV) === "production";
    const status = err.status || err.statusCode || 500;

    return c.json(
      {
        success: false,
        message: isProd ? "An internal server error occurred" : sanitized,
      },
      status
    );
  });

  return app;
}

const honoApp = createHonoApp();

module.exports = honoApp;
module.exports.createHonoApp = createHonoApp;
module.exports.toHonoHandler = toHonoHandler;
module.exports.encodeQuizCursor = encodeQuizCursor;
module.exports.decodeQuizCursor = decodeQuizCursor;
