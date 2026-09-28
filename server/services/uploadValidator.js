/*
 * EduMatrix Edge-Compatible Upload Validation Service (Phase 4: Edge File Uploads)
 * 
 * Provides unified validation for file size, MIME type, file extension,
 * magic byte signature verification, and safe filename sanitization.
 * Compatible with both Web Standard File/Blob (Cloudflare Workers) and Multer req.file (Node.js).
 */

const path = require('path');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max limit to protect memory and isolate limits

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * Sanitizes a filename to prevent path traversal and unsafe characters.
 */
function sanitizeFilename(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return 'uploaded_file';
  }

  // Strip path traversal sequences and separators
  let base = path.basename(originalName).replace(/[/\\]/g, '');
  // Remove null bytes and non-printable characters
  base = base.replace(/[\x00-\x1F\x7F]/g, '');
  // Strip dangerous characters
  base = base.replace(/[<>:"|?*]/g, '_');
  // Trim spaces and dots
  base = base.trim();

  if (!base || base === '.' || base === '..') {
    return 'uploaded_file';
  }

  return base;
}

/**
 * Validates magic byte signatures against expected file format.
 * Returns true if valid or if buffer is too small to inspect, false if known mismatch.
 */
function validateMagicBytes(buffer, expectedMime) {
  if (!buffer || buffer.length < 4) {
    return true; // Not enough bytes to inspect
  }

  const b0 = buffer[0];
  const b1 = buffer[1];
  const b2 = buffer[2];
  const b3 = buffer[3];

  // Executable checks: reject PE headers (MZ), ELF, Java class, or shell shebangs
  if ((b0 === 0x4D && b1 === 0x5A) || // MZ (Windows PE/exe/dll)
      (b0 === 0x7F && b1 === 0x45 && b2 === 0x4C && b3 === 0x46) || // ELF (Linux binary)
      (b0 === 0xCA && b1 === 0xFE && b2 === 0xBA && b3 === 0xBE) || // Mach-O / Java class
      (b0 === 0x23 && b1 === 0x21)) { // #! (Shebang script)
    return false;
  }

  if (expectedMime === 'application/pdf') {
    // PDF magic bytes: %PDF- (0x25, 0x50, 0x44, 0x46)
    return b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46;
  }

  if (expectedMime === 'image/jpeg') {
    // JPEG: 0xFF, 0xD8, 0xFF
    return b0 === 0xFF && b1 === 0xD8 && b2 === 0xFF;
  }

  if (expectedMime === 'image/png') {
    // PNG: 0x89, 0x50, 0x4E, 0x47
    return b0 === 0x89 && b1 === 0x50 && b2 === 0x4E && b3 === 0x47;
  }

  if (expectedMime === 'image/gif') {
    // GIF: GIF8 (0x47, 0x49, 0x46, 0x38)
    return b0 === 0x47 && b1 === 0x49 && b2 === 0x46 && b3 === 0x38;
  }

  if (expectedMime === 'image/webp') {
    // WEBP: starts with RIFF (0x52, 0x49, 0x46, 0x46) and WEBP at byte 8
    if (b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46) {
      if (buffer.length >= 12) {
        const webpTag = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11]);
        return webpTag === 'WEBP';
      }
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Standard file filter logic adhering to EduMatrix security specifications.
 * Preserves exact error message contracts required by tests and frontends.
 */
function validateFileAttributes({ fieldname, originalname, mimetype, size, buffer }) {
  // 1. File size check
  if (size !== undefined && size > MAX_FILE_SIZE) {
    const error = new Error('File too large. Maximum allowed size is 10MB.');
    error.code = 'LIMIT_FILE_SIZE';
    error.statusCode = 400;
    throw error;
  }

  const ext = path.extname(originalname || '').toLowerCase();

  // 2. Avatar validation (student registration)
  if (fieldname === 'avatar') {
    if (mimetype && mimetype.startsWith('image/') && ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      if (buffer && !validateMagicBytes(buffer, mimetype)) {
        const error = new Error('Invalid file type for avatar. Only JPG, PNG, WEBP, and GIF images are allowed.');
        error.statusCode = 400;
        throw error;
      }
      return true;
    }
    const error = new Error('Invalid file type for avatar. Only JPG, PNG, WEBP, and GIF images are allowed.');
    error.statusCode = 400;
    throw error;
  }

  // 3. PDF document validation (summarization, notes, assignments)
  if (fieldname === 'pdf' || fieldname === 'pdfFile') {
    if (mimetype === 'application/pdf' && ext === '.pdf') {
      if (buffer && !validateMagicBytes(buffer, 'application/pdf')) {
        const error = new Error('Invalid file type. Only PDF documents are allowed.');
        error.statusCode = 400;
        throw error;
      }
      return true;
    }
    const error = new Error('Invalid file type. Only PDF documents are allowed.');
    error.statusCode = 400;
    throw error;
  }

  // 4. Fallback validation for any other document/image field
  if (ALLOWED_MIME_TYPES.has(mimetype) && (ext === '.pdf' || ALLOWED_IMAGE_EXTENSIONS.has(ext))) {
    if (buffer && !validateMagicBytes(buffer, mimetype)) {
      const error = new Error('Invalid file type. Only PDF and image files are allowed.');
      error.statusCode = 400;
      throw error;
    }
    return true;
  }

  const error = new Error('Invalid file type. Only PDF and image files are allowed.');
  error.statusCode = 400;
  throw error;
}

/**
 * Adapter for Multer middleware fileFilter callback.
 */
const fileFilter = (req, file, cb) => {
  try {
    validateFileAttributes({
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });
    return cb(null, true);
  } catch (err) {
    return cb(err);
  }
};

module.exports = {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  sanitizeFilename,
  validateMagicBytes,
  validateFileAttributes,
  fileFilter,
};
