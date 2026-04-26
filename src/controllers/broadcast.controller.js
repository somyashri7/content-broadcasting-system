const { getActiveContent } = require("../services/scheduling.service");
const { success, error }   = require("../utils/response");

/**
 * GET /content/live/:teacherId
 * GET /content/live/:teacherId?subject=maths
 *
 * Public endpoint — no auth required
 * Returns currently active, approved, scheduled content for a given teacher
 */
const getLiveContent = async (req, res) => {
  try {
    const teacherId = parseInt(req.params.teacherId);
    const subject   = req.query.subject || null;

    if (isNaN(teacherId)) {
      return res.status(200).json({
        success: true,
        message: "No content available",
        data: [],
      });
    }

    const { content, reason } = await getActiveContent(teacherId, subject);

    if (!content || (Array.isArray(content) && content.length === 0)) {
      return res.status(200).json({
        success: true,
        message: "No content available",
        data: [],
      });
    }

    return success(res, Array.isArray(content) ? content : [content], "Live content fetched");
  } catch (err) {
    console.error("getLiveContent error:", err.message);
    return res.status(200).json({
      success: true,
      message: "No content available",
      data: [],
    });
  }
};

module.exports = { getLiveContent };
