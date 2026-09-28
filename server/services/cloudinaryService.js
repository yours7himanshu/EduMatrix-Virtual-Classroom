/*
 * EduMatrix Edge-Compatible Cloudinary Service (Phase 4: Edge File Uploads)
 * 
 * Replaces Node-specific `cloudinary.uploader.upload_stream` and SDK dependencies
 * with direct HTTPS REST API calls using standard Web `fetch()` and `FormData`.
 * Operates equivalently in Node.js Express and Cloudflare Workers V8 isolates.
 */

const { sanitizeFilename } = require('./uploadValidator');

/**
 * Computes Cloudinary SHA-1 signature.
 * Compatible with WebCrypto (Workers) and Node.js crypto.
 */
async function generateSignature(params, apiSecret) {
  if (!apiSecret) {
    throw new Error('Cloudinary API secret is required for signing');
  }

  // Cloudinary signature convention:
  // Sort parameters alphabetically by key, join as key=value with '&', append secret
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&') + apiSecret;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(toSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  const nodeCrypto = require('crypto');
  return nodeCrypto.createHash('sha1').update(toSign).digest('hex');
}

/**
 * Direct HTTPS REST API file upload to Cloudinary.
 * Eliminates the `cloudinary` SDK and Node stream piping.
 *
 * @param {Object} options
 * @param {Buffer|Uint8Array|Blob|File} options.buffer - Raw binary file data
 * @param {string} [options.mimetype] - MIME type of the file
 * @param {string} [options.originalname] - Original filename
 * @param {string} [options.resourceType='auto'] - 'auto', 'image', or 'raw'
 * @param {Object} [options.env=process.env] - Environment bindings (Cloudflare Worker env or process.env)
 * @returns {Promise<{ secure_url: string, public_id: string, resource_type: string, bytes: number }>}
 */
async function uploadToCloudinary({
  buffer,
  mimetype = 'application/octet-stream',
  originalname = 'file',
  resourceType = 'auto',
  env = (typeof process !== 'undefined' ? process.env : {}),
}) {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    // If running in development/test without credentials, provide safe mock fallback
    if (env.NODE_ENV === 'test' || !cloudName) {
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        secure_url: `https://res.cloudinary.com/mock/edumatrix/${mockId}.pdf`,
        public_id: mockId,
        resource_type: resourceType,
        bytes: buffer ? buffer.length || buffer.size || 0 : 0,
      };
    }
    throw new Error('Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET) are not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await generateSignature({ timestamp }, apiSecret);

  const safeName = sanitizeFilename(originalname);
  const form = new FormData();

  // Create standard Blob for FormData submission
  let fileBlob;
  if (buffer instanceof Blob) {
    fileBlob = buffer;
  } else if (buffer instanceof Uint8Array || Buffer.isBuffer(buffer)) {
    fileBlob = new Blob([buffer], { type: mimetype });
  } else {
    throw new Error('Invalid file buffer provided for Cloudinary upload');
  }

  form.append('file', fileBlob, safeName);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp.toString());
  form.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    response = await fetch(endpoint, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (netErr) {
    if (netErr.name === 'AbortError') {
      throw new Error('Cloudinary upload timed out after 20 seconds');
    }
    throw new Error(`Cloudinary network connection failed: ${netErr.message}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Failed to parse Cloudinary response (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const errMsg = data?.error?.message || `HTTP ${response.status} upload error`;
    throw new Error(`Cloudinary upload failed: ${errMsg}`);
  }

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    resource_type: data.resource_type || resourceType,
    bytes: data.bytes || 0,
    format: data.format,
  };
}

/**
 * Direct HTTPS REST API asset destruction on Cloudinary.
 * Used for rollback/cleanup if subsequent database records fail to save.
 */
async function deleteFromCloudinary({
  publicId,
  resourceType = 'auto',
  env = (typeof process !== 'undefined' ? process.env : {}),
}) {
  if (!publicId) return { result: 'ignored' };

  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { result: 'mock_deleted' };
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await generateSignature(
      { public_id: publicId, timestamp },
      apiSecret
    );

    const form = new FormData();
    form.append('public_id', publicId);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp.toString());
    form.append('signature', signature);

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
    const res = await fetch(endpoint, {
      method: 'POST',
      body: form,
    });

    return await res.json();
  } catch (err) {
    console.warn(`Cloudinary cleanup warning for ${publicId}:`, err.message);
    return { error: err.message };
  }
}

module.exports = {
  generateSignature,
  uploadToCloudinary,
  deleteFromCloudinary,
};
