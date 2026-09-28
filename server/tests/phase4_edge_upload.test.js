const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  MAX_FILE_SIZE,
  sanitizeFilename,
  validateMagicBytes,
  validateFileAttributes,
} = require('../services/uploadValidator');
const {
  generateSignature,
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../services/cloudinaryService');
const { Summarization } = require('../controllers/summarizationController');
const { UploadPdfFile } = require('../controllers/questionUploadController');
const { postAssignment } = require('../controllers/assignmentController');

test('EduMatrix Cloudflare Migration Phase 4: Edge File Uploads Suite', async (t) => {
  // ── 1. Upload Validation & Sanitization ──────────────────────────────────
  await t.test('1. Valid PDF upload passes validation with magic byte verification', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.4 sample content');
    const result = validateFileAttributes({
      fieldname: 'pdfFile',
      originalname: 'syllabus.pdf',
      mimetype: 'application/pdf',
      size: validPdfBuffer.length,
      buffer: validPdfBuffer,
    });
    assert.equal(result, true);
  });

  await t.test('2. Valid image upload passes validation for avatar field', () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
    const result = validateFileAttributes({
      fieldname: 'avatar',
      originalname: 'profile.jpg',
      mimetype: 'image/jpeg',
      size: jpegBuffer.length,
      buffer: jpegBuffer,
    });
    assert.equal(result, true);
  });

  await t.test('3. Rejects spoofed MIME type (executable disguised as PDF)', () => {
    // PE header: MZ (0x4D, 0x5A)
    const fakePdfBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03]);
    assert.throws(
      () => {
        validateFileAttributes({
          fieldname: 'pdf',
          originalname: 'malware.pdf',
          mimetype: 'application/pdf',
          size: fakePdfBuffer.length,
          buffer: fakePdfBuffer,
        });
      },
      (err) => err.message.includes('Invalid file type')
    );
  });

  await t.test('4. Rejects file exceeding 10MB limit with LIMIT_FILE_SIZE', () => {
    const oversized = 11 * 1024 * 1024;
    assert.throws(
      () => {
        validateFileAttributes({
          fieldname: 'pdf',
          originalname: 'huge.pdf',
          mimetype: 'application/pdf',
          size: oversized,
        });
      },
      (err) => err.code === 'LIMIT_FILE_SIZE' && err.message.includes('10MB')
    );
  });

  await t.test('5. Path traversal filename sanitization strips ../, ..\\, and dangerous chars', () => {
    assert.equal(sanitizeFilename('../../etc/passwd.pdf'), 'passwd.pdf');
    assert.equal(sanitizeFilename('..\\..\\windows\\system32\\cmd.exe.pdf'), 'cmd.exe.pdf');
    assert.equal(sanitizeFilename('normal_doc.pdf'), 'normal_doc.pdf');
    assert.equal(sanitizeFilename(''), 'uploaded_file');
    assert.equal(sanitizeFilename('..'), 'uploaded_file');
  });

  // ── 2. Cloudinary REST API Service & Signing ─────────────────────────────
  await t.test('6. Computes valid Cloudinary SHA-1 signature according to REST specs', async () => {
    const sig = await generateSignature({ timestamp: 123456789 }, 'test_secret_key');
    assert.equal(typeof sig, 'string');
    assert.equal(sig.length, 40); // 40-char SHA-1 hex digest
  });

  await t.test('7. uploadToCloudinary returns secure_url and public_id (mock fallback in test env)', async () => {
    const dummyBuffer = Buffer.from('%PDF-1.4 test document');
    const result = await uploadToCloudinary({
      buffer: dummyBuffer,
      mimetype: 'application/pdf',
      originalname: 'test.pdf',
      resourceType: 'auto',
      env: { NODE_ENV: 'test' },
    });

    assert.ok(result.secure_url.includes('cloudinary.com'));
    assert.ok(result.public_id.startsWith('mock_'));
    assert.equal(result.resource_type, 'auto');
    assert.equal(result.bytes, dummyBuffer.length);
  });

  await t.test('8. deleteFromCloudinary handles rollback cleanup without throwing', async () => {
    const res = await deleteFromCloudinary({
      publicId: 'mock_asset_123',
      env: { NODE_ENV: 'test' },
    });
    assert.ok(res.result === 'mock_deleted' || res.result === 'ok');
  });

  // ── 3. Controller Contract Preservation ──────────────────────────────────
  await t.test('9. Summarization controller rejects missing file with 404', async () => {
    let responseStatus;
    let responseJson;
    const req = {}; // no req.file
    const res = {
      status(code) { responseStatus = code; return this; },
      json(data) { responseJson = data; return this; },
    };

    await Summarization(req, res);
    assert.equal(responseStatus, 404);
    assert.equal(responseJson.success, false);
    assert.equal(responseJson.message, 'File not found');
  });

  await t.test('10. QuestionUpload controller rejects missing file with 404', async () => {
    let responseStatus;
    let responseJson;
    const req = {};
    const res = {
      status(code) { responseStatus = code; return this; },
      json(data) { responseJson = data; return this; },
    };

    await UploadPdfFile(req, res);
    assert.equal(responseStatus, 404);
    assert.equal(responseJson.success, false);
    assert.equal(responseJson.message, 'File not found');
  });

  await t.test('11. Assignment controller rejects missing file with 400', async () => {
    let responseStatus;
    let responseJson;
    const req = { body: { title: 'Test Assignment' } }; // no req.file
    const res = {
      status(code) { responseStatus = code; return this; },
      json(data) { responseJson = data; return this; },
    };

    await postAssignment(req, res);
    assert.equal(responseStatus, 400);
    assert.equal(responseJson.success, false);
    assert.equal(responseJson.message, 'Pdf file is required');
  });

  await t.test('12. Invariant: None of the upload controllers or services use upload_stream', () => {
    const fs = require('fs');
    const filesToCheck = [
      path.join(__dirname, '../controllers/summarizationController.js'),
      path.join(__dirname, '../controllers/questionUploadController.js'),
      path.join(__dirname, '../controllers/assignmentController.js'),
      path.join(__dirname, '../controllers/studentController.js'),
    ];

    for (const file of filesToCheck) {
      const src = fs.readFileSync(file, 'utf8');
      assert.ok(
        !src.includes('upload_stream'),
        `File ${path.basename(file)} must not use upload_stream`
      );
      assert.ok(
        !src.includes("require('cloudinary').v2") && !src.includes('require("cloudinary").v2'),
        `File ${path.basename(file)} must not import cloudinary SDK directly`
      );
    }
  });
});
