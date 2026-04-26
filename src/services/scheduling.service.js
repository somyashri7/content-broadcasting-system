const pool = require("../config/db");

/**
 * Core scheduling logic:
 *
 * For a given teacher, fetch all approved content that:
 *   1. Has status = 'approved'
 *   2. Is within start_time / end_time window NOW
 *   3. Belongs to that teacher
 *
 * Then apply rotation:
 *   - Content items are ordered by rotation_order in content_schedule
 *   - Each item has a duration (minutes)
 *   - Using NOW() and the start_time of the EARLIEST active item as epoch,
 *     we determine total elapsed minutes and walk the rotation list
 *
 * Returns: the single active content object, or null
 */
async function getActiveContent(teacherId, subject = null) {
  try {
    // Verify teacher exists
    const teacherCheck = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'teacher'",
      [teacherId]
    );
    if (teacherCheck.rows.length === 0) return { content: null, reason: "teacher_not_found" };

    // Build query for approved, time-windowed content
    let query = `
      SELECT c.*, cs.rotation_order, cs.duration AS schedule_duration
      FROM content c
      JOIN content_schedule cs ON cs.content_id = c.id
      JOIN content_slots sl    ON sl.id = cs.slot_id
      WHERE c.uploaded_by  = $1
        AND c.status        = 'approved'
        AND c.start_time   IS NOT NULL
        AND c.end_time     IS NOT NULL
        AND c.start_time  <= NOW()
        AND c.end_time    >= NOW()
    `;
    const params = [teacherId];

    if (subject) {
      query += ` AND c.subject = $${params.length + 1}`;
      params.push(subject.toLowerCase());
    }

    query += " ORDER BY c.subject, cs.rotation_order ASC";
    const result = await pool.query(query, params);

    if (result.rows.length === 0) return { content: null, reason: "no_active_content" };

    // Group by subject for independent per-subject rotation
    const bySubject = {};
    for (const row of result.rows) {
      if (!bySubject[row.subject]) bySubject[row.subject] = [];
      bySubject[row.subject].push(row);
    }

    // If subject filter is applied, only look at that subject
    const subjects = subject ? [subject.toLowerCase()] : Object.keys(bySubject);

    // For each subject, find the currently active item via rotation math
    const activeItems = [];

    for (const subj of subjects) {
      const items = bySubject[subj];
      if (!items || items.length === 0) continue;

      // Use epoch = earliest start_time among active items for this subject
      const epoch = items.reduce((min, item) =>
        new Date(item.start_time) < new Date(min.start_time) ? item : min
      );
      const epochTime  = new Date(epoch.start_time).getTime();
      const now        = Date.now();
      const elapsedMin = Math.floor((now - epochTime) / (1000 * 60));

      // Total cycle length (sum of all durations)
      const totalCycle = items.reduce((sum, item) => sum + (item.schedule_duration || item.rotation_duration || 5), 0);

      // Position in current cycle
      const posInCycle = totalCycle > 0 ? elapsedMin % totalCycle : 0;

      // Walk the rotation list to find which item is currently active
      let accumulated = 0;
      let activeItem  = items[0]; // fallback

      for (const item of items) {
        const dur = item.schedule_duration || item.rotation_duration || 5;
        if (posInCycle >= accumulated && posInCycle < accumulated + dur) {
          activeItem = item;
          break;
        }
        accumulated += dur;
      }

      activeItems.push(activeItem);
    }

    // If filtering by subject, return single item
    if (subject && activeItems.length > 0) {
      return { content: sanitize(activeItems[0]), reason: null };
    }

    // Without subject filter, return all active items (one per subject)
    if (activeItems.length === 0) return { content: null, reason: "no_active_content" };
    return { content: activeItems.map(sanitize), reason: null };

  } catch (err) {
    console.error("Scheduling error:", err.message);
    return { content: null, reason: "internal_error" };
  }
}

function sanitize(item) {
  // Remove internal fields not needed by students
  const { rotation_order, schedule_duration, file_path, ...safe } = item;
  return safe;
}

module.exports = { getActiveContent };
