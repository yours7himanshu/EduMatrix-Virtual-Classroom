/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


const multer = require("multer");
const path = require("path");

// Memory storage for processing in memory (for Cloudinary direct uploads)
const storage = multer.memoryStorage();

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (file.fieldname === "avatar") {
    if (file.mimetype && file.mimetype.startsWith("image/") && ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      return cb(null, true);
    }
    return cb(new Error("Invalid file type for avatar. Only JPG, PNG, WEBP, and GIF images are allowed."));
  }

  if (file.fieldname === "pdf" || file.fieldname === "pdfFile") {
    if (file.mimetype === "application/pdf" && ext === ".pdf") {
      return cb(null, true);
    }
    return cb(new Error("Invalid file type. Only PDF documents are allowed."));
  }

  // Fallback for other uploads
  if (ALLOWED_MIME_TYPES.has(file.mimetype) && (ext === ".pdf" || ALLOWED_IMAGE_EXTENSIONS.has(ext))) {
    return cb(null, true);
  }

  return cb(new Error("Invalid file type. Only PDF and image files are allowed."));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max limit to protect memory
  },
  fileFilter,
});

upload.fileFilter = fileFilter;

module.exports = upload;
