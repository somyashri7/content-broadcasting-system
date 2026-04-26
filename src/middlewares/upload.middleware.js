const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const UPLOAD_DIR  = process.env.UPLOAD_DIR || "src/uploads";
const MAX_SIZE    = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif"];

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (ALLOWED_EXT.includes(ext) && ALLOWED_MIME.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and GIF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
});

// Error handler for multer
const handleUploadError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File too large. Max size is 10MB" });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = { upload, handleUploadError };
