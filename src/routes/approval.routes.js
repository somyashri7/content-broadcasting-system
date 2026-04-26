const express = require("express");
const router  = express.Router();
const { getAllContent, getPendingContent, approveContent, rejectContent } = require("../controllers/approval.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// All approval routes: principal only
router.use(authenticate, authorize("principal"));

router.get("/all",           getAllContent);
router.get("/pending",       getPendingContent);
router.patch("/:id/approve", approveContent);
router.patch("/:id/reject",  rejectContent);

module.exports = router;
