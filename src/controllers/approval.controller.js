const pool   = require("../config/db");
const { success, error } = require("../utils/response");

// GET /approval/all  (principal sees all content)
const getAllContent = async (req, res) => {
  try {
    const { status, subject, teacher_id } = req.query;
    let query = `
      SELECT c.*, u.name AS teacher_name, u.email AS teacher_email,
             p.name AS approved_by_name
      FROM content c
      JOIN users u ON c.uploaded_by = u.id
      LEFT JOIN users p ON c.approved_by = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status)     { query += ` AND c.status = $${params.length + 1}`;     params.push(status); }
    if (subject)    { query += ` AND c.subject = $${params.length + 1}`;    params.push(subject.toLowerCase()); }
    if (teacher_id) { query += ` AND c.uploaded_by = $${params.length + 1}`; params.push(teacher_id); }

    query += " ORDER BY c.created_at DESC";
    const result = await pool.query(query, params);
    return success(res, result.rows);
  } catch (err) {
    console.error("getAllContent error:", err.message);
    return error(res, "Could not fetch content");
  }
};

// GET /approval/pending
const getPendingContent = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name AS teacher_name, u.email AS teacher_email
      FROM content c
      JOIN users u ON c.uploaded_by = u.id
      WHERE c.status = 'pending'
      ORDER BY c.created_at ASC
    `);
    return success(res, result.rows);
  } catch (err) {
    return error(res, "Could not fetch pending content");
  }
};

// PATCH /approval/:id/approve
const approveContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await pool.query("SELECT * FROM content WHERE id = $1", [id]);
    if (content.rows.length === 0) return error(res, "Content not found", 404);
    if (content.rows[0].status !== "pending") {
      return error(res, `Content is already ${content.rows[0].status}`, 400);
    }

    const result = await pool.query(
      `UPDATE content SET status='approved', approved_by=$1, approved_at=NOW(),
       rejection_reason=NULL WHERE id=$2 RETURNING *`,
      [req.user.id, id]
    );
    return success(res, result.rows[0], "Content approved");
  } catch (err) {
    console.error("approveContent error:", err.message);
    return error(res, "Approval failed");
  }
};

// PATCH /approval/:id/reject
const rejectContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return error(res, "rejection_reason is required", 400);
    }

    const content = await pool.query("SELECT * FROM content WHERE id = $1", [id]);
    if (content.rows.length === 0) return error(res, "Content not found", 404);
    if (content.rows[0].status !== "pending") {
      return error(res, `Content is already ${content.rows[0].status}`, 400);
    }

    const result = await pool.query(
      `UPDATE content SET status='rejected', rejection_reason=$1,
       approved_by=NULL, approved_at=NULL WHERE id=$2 RETURNING *`,
      [rejection_reason.trim(), id]
    );
    return success(res, result.rows[0], "Content rejected");
  } catch (err) {
    console.error("rejectContent error:", err.message);
    return error(res, "Rejection failed");
  }
};

module.exports = { getAllContent, getPendingContent, approveContent, rejectContent };
