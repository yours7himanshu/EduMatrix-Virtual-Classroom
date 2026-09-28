/**
 * Cloudflare Worker Isolated Database Verification Entrypoint
 * 
 * Safely verifies actual Mongoose operations through server/db/db.js inside workerd.
 * Strictly requires MONGO_STAGING_URI and rejects production databases.
 * All operations are strictly read-only (admin ping & Quiz.findOne).
 */

import connectDBPkg from "../../server/db/db.js";
import QuizPkg from "../../server/models/quizModels.js";
import mongoosePkg from "mongoose/index.js";

const connectDB = connectDBPkg.default || connectDBPkg;
const Quiz = QuizPkg.default || QuizPkg;
const mongoose = connectDB.mongoose || (mongoosePkg.default || mongoosePkg);

const DISALLOWED_DB_NAMES = [
  "prod",
  "production",
  "live",
  "edumatrix_prod",
  "edumatrix_production",
  "edumatrix-prod",
  "admin",
  "local",
  "config",
];

/**
 * Extracts database name from MongoDB connection string.
 */
function extractDatabaseName(uri) {
  if (!uri || typeof uri !== "string") return "";
  try {
    // Handle mongodb:// or mongodb+srv://
    const afterProtocol = uri.split("://")[1] || "";
    const afterHost = afterProtocol.split("/")[1] || "";
    const dbName = afterHost.split("?")[0].trim();
    return dbName;
  } catch (_) {
    return "";
  }
}

/**
 * Validates that the staging URI meets explicit staging-only requirements.
 */
function validateStagingUri(uri, expectedDbName) {
  if (!uri || typeof uri !== "string" || !uri.trim()) {
    return { valid: false, error: "MONGO_STAGING_URI is required and cannot be empty." };
  }

  // Reject fallback to default/generic URIs
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    return { valid: false, error: "Invalid MongoDB connection string scheme." };
  }

  const dbName = extractDatabaseName(uri).toLowerCase();
  if (!dbName) {
    return {
      valid: false,
      error: "Staging URI must explicitly specify a dedicated database name in the path.",
    };
  }

  // Check disallowed production or sensitive DB names
  for (const forbidden of DISALLOWED_DB_NAMES) {
    if (dbName === forbidden || dbName.includes("prod") || dbName.includes("live")) {
      return {
        valid: false,
        error: `Database '${dbName}' is rejected because it matches prohibited production identifiers.`,
      };
    }
  }

  // If expected staging database name is configured, enforce strict equality
  if (expectedDbName && typeof expectedDbName === "string" && expectedDbName.trim()) {
    const expected = expectedDbName.trim().toLowerCase();
    if (dbName !== expected) {
      return {
        valid: false,
        error: `Database '${dbName}' does not match configured EXPECTED_STAGING_DB_NAME '${expected}'.`,
      };
    }
  }

  return { valid: true, dbName };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Default health probe
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "db-verify-worker" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname !== "/verify-db") {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Guard: Require runner authorization header to prevent accidental invocation
    const runnerHeader = request.headers.get("X-Worker-Test-Runner");
    if (runnerHeader !== "edumatrix-staging-verify") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Forbidden: Missing or invalid X-Worker-Test-Runner header.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Explicit Staging Safeguards
    const stagingUri = env?.MONGO_STAGING_URI;
    const expectedDbName = env?.EXPECTED_STAGING_DB_NAME;

    // Fail closed if MONGO_STAGING_URI is missing
    if (!stagingUri) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Fail-closed: MONGO_STAGING_URI binding is not configured. Production fallbacks are strictly prohibited.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Reject accidental fallback to production env variables
    if (env.MONGO_URI || env.MONGODB_URI) {
      // Ensure MONGO_STAGING_URI is not accidentally referencing the production variable
      if (stagingUri === env.MONGO_URI || stagingUri === env.MONGODB_URI) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Security violation: MONGO_STAGING_URI matches production database URI binding.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const validation = validateStagingUri(stagingUri, expectedDbName);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Staging configuration rejected: ${validation.error}`,
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Perform real database manager invocation & harmless read-only queries
    const startTime = Date.now();
    try {
      // 1. Invoke real application database manager server/db/db.js
      await connectDB(stagingUri);

      // 2. Harmless ping command through Mongoose connection
      const pingResult = await mongoose.connection.db.admin().ping();
      const pingOk = pingResult && (pingResult.ok === 1 || pingResult.ok === true);

      // 3. Harmless read-only query using real application Quiz model
      // select('_id').lean() is strictly read-only and safe even on empty or absent collections
      const sampleQuiz = await Quiz.findOne({}).select("_id").lean();
      const quizQueryOk = sampleQuiz !== undefined; // null (empty collection) or object (found doc) is valid

      const durationMs = Date.now() - startTime;

      // 4. Return sanitized verification metadata ONLY (no secrets, no doc contents, no URIs)
      return new Response(
        JSON.stringify({
          success: true,
          runtime: "workerd",
          manager: "server/db/db.js",
          databaseTarget: "staging",
          databaseName: validation.dbName,
          connectionState: connectDB.getConnectionState(),
          isDbConnected: connectDB.isDbConnected(),
          operation: "read-only",
          pingVerified: Boolean(pingOk),
          quizModelQueryVerified: Boolean(quizQueryOk),
          durationMs,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const sanitized = connectDB.sanitizeMongoUri(err.message || String(err));
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database verification operation failed inside Worker runtime",
          sanitizedMessage: sanitized,
          durationMs,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
