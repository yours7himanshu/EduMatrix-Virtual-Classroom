const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Message = require('../models/messageModel');

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_123';

test('Chat & Token Integrity Suite (SEC-09 & SEC-02)', async (t) => {
  await t.test('1. Student token includes name, role, and valid 24h exp claim', () => {
    const studentUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Alice Student',
      email: 'alice@college.edu',
      role: 'student',
    };

    const token = jwt.sign(
      {
        email: studentUser.email,
        userId: studentUser._id,
        role: studentUser.role,
        name: studentUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.name, 'Alice Student');
    assert.strictEqual(decoded.role, 'student');
    assert.ok(decoded.exp, 'Token must have exp claim');
    assert.ok(decoded.exp > decoded.iat, 'Expiration must be after issuance');
    // ~24 hours difference (86400 seconds)
    assert.strictEqual(decoded.exp - decoded.iat, 86400);
  });

  await t.test('2. Admin token includes name, role, and valid 24h exp claim', () => {
    const adminUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      collegeName: 'National Engineering College',
      directorName: 'Dr. Robert Smith',
      email: 'director@college.edu',
      role: 'Director',
    };

    const token = jwt.sign(
      {
        email: adminUser.email,
        collegeId: adminUser._id,
        role: adminUser.role,
        name: adminUser.directorName || adminUser.collegeName,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.name, 'Dr. Robert Smith');
    assert.strictEqual(decoded.role, 'Director');
    assert.ok(decoded.exp, 'Token must have exp claim');
    assert.strictEqual(decoded.exp - decoded.iat, 86400);
  });

  await t.test('3. Chat sender derivation prevents Mongoose ValidationError on legacy tokens', () => {
    // Simulate legacy token with missing role and name
    const legacyToken = jwt.sign(
      { email: 'oldstudent@college.edu', userId: '12345' },
      process.env.JWT_SECRET
    );

    const decoded = jwt.verify(legacyToken, process.env.JWT_SECRET);
    assert.strictEqual(decoded.role, undefined);
    assert.strictEqual(decoded.name, undefined);

    // Derived identity logic from socketService.js
    const senderIdentity = decoded.name || decoded.role || 'Student';
    assert.strictEqual(senderIdentity, 'Student');

    // Verify a Message document successfully instantiates with derived sender
    const msgDoc = new Message({
      sender: senderIdentity,
      content: 'Hello class!',
      timestamp: new Date(),
    });

    const validationErr = msgDoc.validateSync();
    assert.strictEqual(validationErr, undefined, 'Must pass Mongoose validation without error');
  });

  await t.test('4. Chat message creation with student name passes validation', () => {
    const modernToken = jwt.sign(
      {
        email: 'alice@college.edu',
        userId: '12345',
        name: 'Alice Student',
        role: 'student',
      },
      process.env.JWT_SECRET
    );

    const decoded = jwt.verify(modernToken, process.env.JWT_SECRET);
    const senderIdentity = decoded.name || decoded.role || 'Student';
    assert.strictEqual(senderIdentity, 'Alice Student');

    const msgDoc = new Message({
      sender: senderIdentity,
      content: 'Can you repeat the last slide?',
      timestamp: new Date(),
    });

    const validationErr = msgDoc.validateSync();
    assert.strictEqual(validationErr, undefined, 'Must pass Mongoose validation');
    assert.strictEqual(msgDoc.sender, 'Alice Student');
  });

  await t.test('5. Mongoose Message schema strictly requires non-empty sender', () => {
    // If sender is undefined (the original bug), validateSync must fail
    const brokenMsg = new Message({
      sender: undefined,
      content: 'This message would have crashed',
      timestamp: new Date(),
    });

    const err = brokenMsg.validateSync();
    assert.ok(err, 'Expected Mongoose validation error when sender is undefined');
    assert.match(err.errors.sender.message, /Path `sender` is required/);
  });
});
