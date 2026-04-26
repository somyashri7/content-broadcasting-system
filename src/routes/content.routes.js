const express = require("express");
const router  = express.Router();
const { uploadContent, getMyContent, getContentById } = require("../controllers/content.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { upload, handleUploadError } = require("../middlewares/upload.middleware");

// Teacher: upload content
router.post(
  "/upload",
  authenticate,
  authorize("teacher"),
  upload.single("file"),
  handleUploadError,
  uploadContent
);

// Teacher: view their own content
router.get("/my", authenticate, authorize("teacher"), getMyContent);

// Teacher or Principal: view single content
router.get("/:id", authenticate, getContentById);

module.exports = router;
