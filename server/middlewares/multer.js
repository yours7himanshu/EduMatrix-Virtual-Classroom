const multer = require("multer");

// Memory storage for processing in memory (for Cloudinary direct uploads)
const storage = multer.memoryStorage(); 

const upload = multer({ storage });
module.exports = upload;
