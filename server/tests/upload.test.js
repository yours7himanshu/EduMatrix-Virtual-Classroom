const test = require('node:test');
const assert = require('node:assert');
const upload = require('../middlewares/multer');

test('Multer Upload Security & Validation Suite (SEC-06)', async (t) => {
  await t.test('1. Configures 10MB memory limit to prevent heap exhaustion DoS', () => {
    assert.strictEqual(upload.limits.fileSize, 10 * 1024 * 1024);
  });

  await t.test('2. Allows valid PDF upload for pdf/pdfFile field', (_, done) => {
    const file = {
      fieldname: 'pdfFile',
      originalname: 'syllabus.pdf',
      mimetype: 'application/pdf',
    };

    upload.fileFilter({}, file, (err, accept) => {
      assert.strictEqual(err, null);
      assert.strictEqual(accept, true);
      done();
    });
  });

  await t.test('3. Rejects executable file disguised as PDF or with wrong extension', (_, done) => {
    const file = {
      fieldname: 'pdfFile',
      originalname: 'exploit.exe',
      mimetype: 'application/octet-stream',
    };

    upload.fileFilter({}, file, (err, accept) => {
      assert.ok(err instanceof Error);
      assert.strictEqual(err.message, 'Invalid file type. Only PDF documents are allowed.');
      assert.strictEqual(accept, undefined);
      done();
    });
  });

  await t.test('4. Allows valid image uploads for avatar field', (_, done) => {
    const validImages = [
      { originalname: 'avatar.jpg', mimetype: 'image/jpeg' },
      { originalname: 'photo.png', mimetype: 'image/png' },
      { originalname: 'profile.webp', mimetype: 'image/webp' },
    ];

    let checked = 0;
    for (const img of validImages) {
      const file = { fieldname: 'avatar', ...img };
      upload.fileFilter({}, file, (err, accept) => {
        assert.strictEqual(err, null);
        assert.strictEqual(accept, true);
        checked++;
        if (checked === validImages.length) done();
      });
    }
  });

  await t.test('5. Rejects PDF uploaded into avatar image field', (_, done) => {
    const file = {
      fieldname: 'avatar',
      originalname: 'document.pdf',
      mimetype: 'application/pdf',
    };

    upload.fileFilter({}, file, (err, accept) => {
      assert.ok(err instanceof Error);
      assert.strictEqual(err.message, 'Invalid file type for avatar. Only JPG, PNG, WEBP, and GIF images are allowed.');
      assert.strictEqual(accept, undefined);
      done();
    });
  });

  await t.test('6. Rejects non-whitelisted extension or MIME type on general upload', (_, done) => {
    const file = {
      fieldname: 'otherDoc',
      originalname: 'script.sh',
      mimetype: 'application/x-sh',
    };

    upload.fileFilter({}, file, (err, accept) => {
      assert.ok(err instanceof Error);
      assert.strictEqual(err.message, 'Invalid file type. Only PDF and image files are allowed.');
      assert.strictEqual(accept, undefined);
      done();
    });
  });
});
