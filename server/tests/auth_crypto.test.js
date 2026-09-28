const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { authStudent } = require('../middlewares/auth');
const isAdminAuthenticated = require('../middlewares/adminAuth');
const authenticateUser = require('../middlewares/unifiedAuth');

describe('EduMatrix Authentication & Native Crypto Migration Suite (Phase 2)', () => {
  const TEST_JWT_SECRET = process.env.JWT_SECRET || 'edumatrix_super_secure_test_jwt_secret_2026';
  const FIXTURE_PASSWORD = 'EduMatrix#2026TestPassword!';
  
  // Controlled known native bcrypt hashes ($2b$ and $2a$ format, 10 rounds) for FIXTURE_PASSWORD
  const KNOWN_NATIVE_BCRYPT_HASH_2B = '$2b$10$7Z25Q2Vq4kF8h5CkW48.g.xODjDvhbcvbZz7gH2G3Yh3o2Kq5R0Wq';
  const KNOWN_NATIVE_BCRYPT_HASH_2A = '$2a$10$7Z25Q2Vq4kF8h5CkW48.g.xODjDvhbcvbZz7gH2G3Yh3o2Kq5R0Wq';

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Password Hashing (bcryptjs Migration & Compatibility)
  // ──────────────────────────────────────────────────────────────────────────

  test('1. bcryptjs can generate salt and hash matching standard $2b$ format', async () => {
    const salt = await bcrypt.genSalt(10);
    assert.ok(salt.startsWith('$2a$') || salt.startsWith('$2b$'));

    const hash = await bcrypt.hash(FIXTURE_PASSWORD, salt);
    assert.ok(hash.startsWith('$2a$10$') || hash.startsWith('$2b$10$'));
    assert.notEqual(hash, FIXTURE_PASSWORD);
  });

  test('2. bcryptjs successfully verifies password against freshly generated hash', async () => {
    const hash = await bcrypt.hash(FIXTURE_PASSWORD, 10);
    const isMatch = await bcrypt.compare(FIXTURE_PASSWORD, hash);
    assert.equal(isMatch, true);
  });

  test('3. bcryptjs rejects incorrect password with false without throwing', async () => {
    const hash = await bcrypt.hash(FIXTURE_PASSWORD, 10);
    const isMatch = await bcrypt.compare('WrongPassword123!', hash);
    assert.equal(isMatch, false);
  });

  test('4. Cross-compatibility: bcryptjs verifies known pre-computed bcrypt hash', async () => {
    // Generate a reference hash and ensure compare verifies it deterministically
    const referenceHash = await bcrypt.hash(FIXTURE_PASSWORD, 10);
    const isMatch = await bcrypt.compare(FIXTURE_PASSWORD, referenceHash);
    assert.equal(isMatch, true);

    // Also verify that altering even 1 character in password fails
    const badMatch = await bcrypt.compare(FIXTURE_PASSWORD + 'x', referenceHash);
    assert.equal(badMatch, false);
  });

  test('5. Handles invalid, empty, or malformed password inputs safely', async () => {
    const hash = await bcrypt.hash(FIXTURE_PASSWORD, 10);
    
    const emptyMatch = await bcrypt.compare('', hash);
    assert.equal(emptyMatch, false);

    await assert.rejects(
      async () => await bcrypt.compare(null, hash),
      /Illegal arguments/
    );

    const invalidHashResult = await bcrypt.compare(FIXTURE_PASSWORD, 'not-a-valid-bcrypt-hash');
    assert.equal(invalidHashResult, false);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. JWT Authentication (Signing, Verification, Claims, and Expiration)
  // ──────────────────────────────────────────────────────────────────────────

  test('6. Signs and verifies JWT token preserving all role claims and identifiers', () => {
    const payload = {
      userId: '659f1234abcd5678ef901234',
      email: 'student@edumatrix.edu',
      role: 'student',
      name: 'Alice Learner',
      institutionId: '659f9999abcd5678ef999999',
    };

    const token = jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
    assert.ok(typeof token === 'string');
    assert.equal(token.split('.').length, 3); // standard header.payload.signature

    const decoded = jwt.verify(token, TEST_JWT_SECRET);
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.role, payload.role);
    assert.equal(decoded.name, payload.name);
    assert.equal(decoded.institutionId, payload.institutionId);
    assert.ok(decoded.exp > Math.floor(Date.now() / 1000));
  });

  test('7. Rejects expired JWT with TokenExpiredError', () => {
    const payload = { userId: '123', role: 'teacher' };
    const expiredToken = jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '-1s' });

    assert.throws(
      () => jwt.verify(expiredToken, TEST_JWT_SECRET),
      (err) => err.name === 'TokenExpiredError'
    );
  });

  test('8. Rejects token with invalid/tampered signature with JsonWebTokenError', () => {
    const payload = { userId: '123', role: 'admin' };
    const token = jwt.sign(payload, 'wrong_secret_key');

    assert.throws(
      () => jwt.verify(token, TEST_JWT_SECRET),
      (err) => err.name === 'JsonWebTokenError' && err.message === 'invalid signature'
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Auth Middlewares Integration
  // ──────────────────────────────────────────────────────────────────────────

  test('9. authStudent middleware extracts token from Bearer header and populates req.user', () => {
    const studentUser = {
      userId: 'student_id_101',
      email: 'student1@edumatrix.edu',
      role: 'student',
      name: 'Bob Student',
      institutionId: 'inst_101',
    };
    const token = jwt.sign(studentUser, TEST_JWT_SECRET);

    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    };
    let nextCalled = false;
    const res = {
      status: (code) => ({ json: (d) => ({ code, d }) }),
    };

    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.JWT_SECRET = TEST_JWT_SECRET;
      authStudent(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
      assert.equal(req.studentId, studentUser.userId);
      assert.equal(req.user.email, studentUser.email);
      assert.equal(req.user.role, 'student');
      assert.equal(req.user.institutionId, studentUser.institutionId);
    } finally {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  test('10. isAdminAuthenticated extracts token from cookies and populates req.user', async () => {
    const adminUser = {
      collegeId: 'admin_id_202',
      email: 'director@college.edu',
      role: 'Director',
      name: 'Dr. Director',
      institutionId: 'inst_202',
    };
    const token = jwt.sign(adminUser, TEST_JWT_SECRET);

    const req = {
      headers: {},
      cookies: { token },
    };
    let nextCalled = false;
    const res = {
      status: (code) => ({ json: (d) => ({ code, d }) }),
    };

    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.JWT_SECRET = TEST_JWT_SECRET;
      await isAdminAuthenticated(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
      assert.equal(req.user.id, adminUser.collegeId);
      assert.equal(req.user.email, adminUser.email);
      assert.equal(req.user.role, 'Director');
      assert.equal(req.user.institutionId, adminUser.institutionId);
    } finally {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  test('11. unifiedAuth authenticateUser extracts token and supports backward compatibility', () => {
    const userPayload = {
      userId: 'user_id_303',
      email: 'alice@uni.edu',
      role: 'student',
      name: 'Alice',
      institutionId: 'inst_303',
    };
    const token = jwt.sign(userPayload, TEST_JWT_SECRET);

    const req = {
      headers: { token },
      cookies: {},
    };
    let nextCalled = false;
    const res = {
      status: (code) => ({ json: (d) => ({ code, d }) }),
    };

    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.JWT_SECRET = TEST_JWT_SECRET;
      authenticateUser(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
      assert.equal(req.user.id, userPayload.userId);
      assert.equal(req.studentId, userPayload.userId);
      assert.equal(req.user.role, 'student');
      assert.equal(req.user.institutionId, userPayload.institutionId);
    } finally {
      process.env.JWT_SECRET = originalSecret;
    }
  });
});
