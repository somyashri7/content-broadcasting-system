const path   = require("path");
const pool   = require("../config/db");
const { success, error } = require("../utils/response");

// POST /content/upload  (teacher only)
const uploadContent = async (req, res) => {
  try {
    if (!req.file) return error(res, "File is required", 400);

    const { title, subject, description, start_time, end_time, rotation_duration } = req.body;

    if (!title || !title.trim())   return error(res, "Title is required", 400);
    if (!subject || !subject.trim()) return error(res, "Subject is required", 400);

    // Validate time window if provided
    if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
      return error(res, "start_time must be before end_time", 400);
    }

    const file      = req.file;
    const file_url  = `/uploads/${file.filename}`;
    const file_path = file.path;

    const result = await pool.query(
      `INSERT INTO content
         (title, description, subject, file_path, file_url, file_type, file_size,
          uploaded_by, status, start_time, end_time, rotation_duration)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,$10,$11)
       RETURNING *`,
      [
        title.trim(),
        description || null,
        subject.trim().toLowerCase(),
        file_path,
        file_url,
        file.mimetype,
        file.size,
        req.user.id,
        start_time || null,
        end_time   || null,
        rotation_duration ? parseInt(rotation_duration) : 5,
      ]
    );

    // Auto-create or find subject slot for this teacher
    await pool.query(
      `INSERT INTO content_slots (subject, teacher_id)
       VALUES ($1, $2) ON CONFLICT (subject, teacher_id) DO NOTHING`,
      [subject.trim().toLowerCase(), req.user.id]
    );

    // Link content to schedule
    const slotResult = await pool.query(
      "SELECT id FROM content_slots WHERE subject = $1 AND teacher_id = $2",
      [subject.trim().toLowerCase(), req.user.id]
    );

    if (slotResult.rows.length > 0) {
      const slot_id = slotResult.rows[0].id;
      // Get next rotation order
      const orderResult = await pool.query(
        "SELECT COALESCE(MAX(rotation_order), -1) + 1 AS next_order FROM content_schedule WHERE slot_id = $1",
        [slot_id]
      );
      const next_order = orderResult.rows[0].next_order;
      await pool.query(
        "INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration) VALUES ($1,$2,$3,$4)",
        [result.rows[0].id, slot_id, next_order, rotation_duration ? parseInt(rotation_duration) : 5]
      );
    }

    return success(res, result.rows[0], "Content uploaded successfully", 201);
  } catch (err) {
    console.error("uploadContent error:", err.message);
    return error(res, "Upload failed");
  }
};

// GET /content/my  (teacher sees their own)
const getMyContent = async (req, res) => {
  try {
    const { status, subject } = req.query;
    let query = "SELECT * FROM content WHERE uploaded_by = $1";
    const params = [req.user.id];

    if (status) { query += ` AND status = $${params.length + 1}`; params.push(status); }
    if (subject) { query += ` AND subject = $${params.length + 1}`; params.push(subject.toLowerCase()); }

    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    return success(res, result.rows);
  } catch (err) {
    return error(res, "Could not fetch content");
  }
};

// GET /content/:id  (teacher or principal)
const getContentById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM content WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return error(res, "Content not found", 404);
    const content = result.rows[0];
    // Teachers can only view their own content
    if (req.user.role === "teacher" && content.uploaded_by !== req.user.id) {
      return error(res, "Access denied", 403);
    }
    return success(res, content);
  } catch (err) {
    return error(res, "Could not fetch content");
  }
};

module.exports = { uploadContent, getMyContent, getContentById };
