const express = require("express");
const router  = express.Router();
const rateLimit = require("express-rate-limit");
const { getLiveContent } = require("../controllers/broadcast.controller");

// Rate limit: 60 requests per minute per IP on public endpoint
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, slow down." },
});

router.get("/live/:teacherId", limiter, getLiveContent);

module.exports = router;
