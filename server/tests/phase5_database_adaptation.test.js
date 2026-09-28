const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const mongoose = require('mongoose');

const connectDB = require('../db/db');
const {
  isDbConnected,
  getConnectionState,
  disconnectDB,
  sanitizeMongoUri,
} = connectDB;

test('EduMatrix Cloudflare Migration Phase 5: Database Adaptation Suite', async (t) => {
  // ── 1. Credential Redaction & URI Sanitization ───────────────────────────
  await t.test('1. sanitizeMongoUri redacts username and password from standard mongodb:// URI', () => {
    const raw = 'mongodb://appUser:MySecretPassword123!@localhost:27017/edumatrix?authSource=admin';
    const sanitized = sanitizeMongoUri(raw);

    assert.ok(!sanitized.includes('MySecretPassword123!'));
    assert.ok(!sanitized.includes('appUser'));
    assert.ok(sanitized.includes('[REDACTED_CREDENTIALS]'));
    assert.equal(sanitized, 'mongodb://[REDACTED_CREDENTIALS]@localhost:27017/edumatrix?authSource=admin');
  });

  await t.test('2. sanitizeMongoUri redacts credentials from SRV mongodb+srv:// connection string', () => {
    const raw = 'mongodb+srv://admin_himanshu:P%40ssw0rd99@cluster0.mkcqp.mongodb.net/edumatrix?retryWrites=true&w=majority';
    const sanitized = sanitizeMongoUri(raw);

    assert.ok(!sanitized.includes('P%40ssw0rd99'));
    assert.ok(!sanitized.includes('admin_himanshu'));
    assert.ok(sanitized.includes('[REDACTED_CREDENTIALS]'));
    assert.equal(sanitized, 'mongodb+srv://[REDACTED_CREDENTIALS]@cluster0.mkcqp.mongodb.net/edumatrix?retryWrites=true&w=majority');
  });

  await t.test('3. sanitizeMongoUri redacts credentials embedded in multi-line error traces', () => {
    const errorText = 'MongoServerSelectionError: connection <monitor> to mongodb+srv://clusterAdmin:TopSecretPass@cluster0.net:27017 closed\n    at connectionFailure (/app/node_modules/mongodb/lib/sdam/server.js:312:35)';
    const sanitized = sanitizeMongoUri(errorText);

    assert.ok(!sanitized.includes('TopSecretPass'));
    assert.ok(!sanitized.includes('clusterAdmin'));
    assert.ok(sanitized.includes('mongodb+srv://[REDACTED_CREDENTIALS]@cluster0.net:27017 closed'));
  });

  await t.test('4. sanitizeMongoUri preserves URI without credentials and handles non-string safely', () => {
    const plainUri = 'mongodb://127.0.0.1:27017/edumatrix';
    assert.equal(sanitizeMongoUri(plainUri), plainUri);

    // Empty / nullish
    assert.equal(sanitizeMongoUri(''), '');
    assert.equal(sanitizeMongoUri(null), '');
    assert.equal(sanitizeMongoUri(undefined), '');

    // Error object input
    const errObj = new Error('Failed to connect to mongodb://user:pass@host:27017/db');
    const sanitizedErr = sanitizeMongoUri(errObj);
    assert.ok(!sanitizedErr.includes('pass'));
    assert.ok(sanitizedErr.includes('[REDACTED_CREDENTIALS]'));
  });

  // ── 2. Database Manager API & State Reporting ───────────────────────────
  await t.test('5. Exports all required connection management functions on module and default', () => {
    assert.equal(typeof connectDB, 'function');
    assert.equal(typeof connectDB.connectDB, 'function');
    assert.equal(typeof connectDB.isDbConnected, 'function');
    assert.equal(typeof connectDB.getConnectionState, 'function');
    assert.equal(typeof connectDB.disconnectDB, 'function');
    assert.equal(typeof connectDB.sanitizeMongoUri, 'function');

    assert.equal(typeof isDbConnected, 'function');
    assert.equal(typeof getConnectionState, 'function');
    assert.equal(typeof disconnectDB, 'function');
    assert.equal(typeof sanitizeMongoUri, 'function');
  });

  await t.test('6. getConnectionState and isDbConnected accurately reflect connection state', () => {
    const stateName = getConnectionState();
    const validStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    assert.ok(validStates.includes(stateName));

    const isConnected = isDbConnected();
    assert.equal(typeof isConnected, 'boolean');
    assert.equal(isConnected, mongoose.connection.readyState === 1);
  });

  // ── 3. Connection Promise Caching & Concurrency Coalescing ────────────────
  await t.test('7. Concurrent connection calls coalesce into the same in-flight promise', async () => {
    // If already connected, disconnect first to test cold start concurrency
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await disconnectDB();
    }

    // Call connectDB concurrently with a mock URI on closed port with fast timeout
    const unreachableUri = 'mongodb://127.0.0.1:65530/test?connectTimeoutMS=50&serverSelectionTimeoutMS=50';

    const p1 = connectDB(unreachableUri);
    const p2 = connectDB(unreachableUri);
    const p3 = connectDB(unreachableUri);

    // All three promises must be strictly identical references (cached promise)
    assert.equal(p1, p2, 'p1 and p2 must be the exact same cached Promise');
    assert.equal(p2, p3, 'p2 and p3 must be the exact same cached Promise');

    // All settle together with sanitized error; handle all to prevent unhandled rejection
    const results = await Promise.allSettled([p1, p2, p3]);
    for (const res of results) {
      assert.equal(res.status, 'rejected');
      assert.ok(!res.reason.message.includes('password'));
    }
  });

  await t.test('8. Connection failure resets cached promise allowing subsequent retries', async () => {
    // After previous failure, connectionPromise must have been reset to null
    const unreachableUri = 'mongodb://127.0.0.1:65530/test?connectTimeoutMS=50&serverSelectionTimeoutMS=50';

    const pRetry = connectDB(unreachableUri);
    assert.ok(pRetry instanceof Promise, 'Subsequent call returns a new Promise');

    await assert.rejects(pRetry);
  });

  await t.test('9. Rethrown connection error has credentials redacted in message', async () => {
    const fakeAuthUri = 'mongodb://secretUser:SuperConfidentialPass99@127.0.0.1:65530/test?connectTimeoutMS=50&serverSelectionTimeoutMS=50';

    await assert.rejects(
      connectDB(fakeAuthUri),
      (err) => {
        assert.ok(!err.message.includes('SuperConfidentialPass99'));
        assert.ok(!err.message.includes('secretUser'));
        return true;
      }
    );
  });

  // ── 4. Environment Binding & Options Resolution ──────────────────────────
  await t.test('10. connectDB resolves URI from string, options.uri, or options.env.MONGO_URI', async () => {
    const origEnv = process.env.MONGO_URI;
    try {
      delete process.env.MONGO_URI;

      // 1. Missing URI returns null with warning
      const resMissing = await connectDB();
      assert.equal(resMissing, null);

      // 2. Object with env binding (Worker pattern: { env: { MONGO_URI } })
      const mockWorkerEnv = {
        env: {
          MONGO_URI: 'mongodb://127.0.0.1:65530/test?connectTimeoutMS=50&serverSelectionTimeoutMS=50',
        },
      };
      await assert.rejects(connectDB(mockWorkerEnv));

      // 3. Object with direct uri ({ uri })
      const mockOptions = {
        uri: 'mongodb://127.0.0.1:65530/test?connectTimeoutMS=50&serverSelectionTimeoutMS=50',
      };
      await assert.rejects(connectDB(mockOptions));
    } finally {
      if (origEnv) process.env.MONGO_URI = origEnv;
    }
  });

  // ── 5. Model Overwrite Protection (All 19 Compiled Models) ────────────────
  await t.test('11. All 19 compiled models reload cleanly without OverwriteModelError', () => {
    const modelsDir = path.resolve(__dirname, '../models');
    const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js') && f !== 'registrarModels.js');

    assert.equal(modelFiles.length, 19, 'Should have exactly 19 compiled model files');

    // First load
    const loadedModels = {};
    for (const file of modelFiles) {
      const fullPath = path.join(modelsDir, file);
      loadedModels[file] = require(fullPath);
      assert.ok(loadedModels[file], `${file} should export a model`);
    }

    // Clear require cache for model files
    for (const file of modelFiles) {
      const fullPath = path.join(modelsDir, file);
      delete require.cache[fullPath];
    }

    // Second load: MUST NOT throw OverwriteModelError
    for (const file of modelFiles) {
      const fullPath = path.join(modelsDir, file);
      assert.doesNotThrow(
        () => {
          const reloaded = require(fullPath);
          assert.equal(reloaded, loadedModels[file], `${file} should return cached model on recompilation`);
        },
        `Re-requiring ${file} must not throw OverwriteModelError`
      );
    }
  });

  // ── 6. Representative Real Application Model Validation & Constraints ─────
  await t.test('12. User model enforces validation, defaults, and enum constraints', () => {
    const User = require('../models/userModels');

    // Valid User
    const validUser = new User({
      name: 'Faculty Test',
      username: 'faculty_test_01',
      email: 'faculty@edumatrix.edu',
      password: 'hashed_password_sample',
      role: 'teacher',
    });
    const validErr = validUser.validateSync();
    assert.equal(validErr, undefined, 'Valid user document should have zero validation errors');

    // Default Role
    const defaultUser = new User({
      name: 'Admin Test',
      username: 'admin_test_01',
      email: 'admin@edumatrix.edu',
      password: 'hashed_password_sample',
    });
    assert.equal(defaultUser.role, 'admin', 'User should default role to "admin"');

    // Required fields missing
    const emptyUser = new User({});
    const emptyErr = emptyUser.validateSync();
    assert.ok(emptyErr, 'Empty user must produce validation errors');
    assert.ok(emptyErr.errors.name, 'name is required');
    assert.ok(emptyErr.errors.username, 'username is required');
    assert.ok(emptyErr.errors.email, 'email is required');
    assert.ok(emptyErr.errors.password, 'password is required');

    // Invalid enum role
    const invalidRoleUser = new User({
      name: 'Bad Role',
      username: 'bad_user',
      email: 'bad@edumatrix.edu',
      password: 'pass',
      role: 'superhacker',
    });
    const roleErr = invalidRoleUser.validateSync();
    assert.ok(roleErr && roleErr.errors.role, 'Invalid role must fail enum validation');
  });

  await t.test('13. Classroom model enforces required course fields and indexes', () => {
    const Classroom = require('../models/classroomModel');

    const validClassroom = new Classroom({
      title: 'Computer Science 101',
      courseCode: 'CS101',
      description: 'Intro to CS',
      branch: 'CSE',
      batch: '2026',
      institutionId: new mongoose.Types.ObjectId(),
      teacherId: new mongoose.Types.ObjectId(),
    });
    const validErr = validClassroom.validateSync();
    assert.equal(validErr, undefined, 'Valid classroom document should have zero validation errors');

    const invalidClassroom = new Classroom({});
    const err = invalidClassroom.validateSync();
    assert.ok(err && err.errors.title);
    assert.ok(err && err.errors.courseCode);
  });

  await t.test('14. StudentFeeAccount model enforces academic fee structure constraints', () => {
    const StudentFeeAccount = require('../models/studentFeeAccountModel');

    const validAccount = new StudentFeeAccount({
      institutionId: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(),
      academicYear: 1,
      academicSession: '2025-2026',
      branch: 'CSE',
      totalAssessed: 85000,
      netAssessed: 85000,
      totalPaid: 25000,
      outstandingBalance: 60000,
    });

    const err = validAccount.validateSync();
    assert.equal(err, undefined, 'Valid StudentFeeAccount should have zero validation errors');
    assert.equal(validAccount.status, 'unpaid', 'status should default to "unpaid"');

    // Test enum validation
    validAccount.status = 'partially_paid';
    assert.equal(validAccount.validateSync(), undefined);

    validAccount.status = 'invalid_status_value';
    const enumErr = validAccount.validateSync();
    assert.ok(enumErr && enumErr.errors.status, 'Invalid status must fail enum validation');
  });

  // ── 7. Serverless Timeout & Connection Options Validation ─────────────────
  await t.test('15. Validates serverless connection configuration options rationale', () => {
    const options = {
      bufferCommands: false,
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    assert.equal(options.bufferCommands, false);
    assert.equal(options.maxPoolSize, 1);
    assert.ok(options.serverSelectionTimeoutMS <= 5000, 'Selection timeout must not exceed 5000ms');
    assert.ok(options.connectTimeoutMS <= 10000, 'Connect timeout must not exceed 10000ms');
    assert.ok(options.connectTimeoutMS >= options.serverSelectionTimeoutMS, 'Connect timeout must be >= selection timeout');
  });
});
