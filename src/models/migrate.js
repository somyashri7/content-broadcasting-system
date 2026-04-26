require("dotenv").config();
const pool = require("../config/db");

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── Users ──────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role          VARCHAR(20)  NOT NULL CHECK (role IN ('principal','teacher')),
        created_at    TIMESTAMPTZ  DEFAULT NOW()
      );
    `);

    // ── Content ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS content (
        id               SERIAL PRIMARY KEY,
        title            VARCHAR(200) NOT NULL,
        description      TEXT,
        subject          VARCHAR(100) NOT NULL,
        file_path        VARCHAR(500) NOT NULL,
        file_url         VARCHAR(500) NOT NULL,
        file_type        VARCHAR(50)  NOT NULL,
        file_size        INTEGER      NOT NULL,
        uploaded_by      INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','approved','rejected')),
        rejection_reason TEXT,
        approved_by      INTEGER REFERENCES users(id),
        approved_at      TIMESTAMPTZ,
        start_time       TIMESTAMPTZ,
        end_time         TIMESTAMPTZ,
        rotation_duration INTEGER DEFAULT 5,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── Content Slots (subject-based) ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_slots (
        id         SERIAL PRIMARY KEY,
        subject    VARCHAR(100) NOT NULL,
        teacher_id INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ  DEFAULT NOW(),
        UNIQUE (subject, teacher_id)
      );
    `);

    // ── Content Schedule ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_schedule (
        id             SERIAL PRIMARY KEY,
        content_id     INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
        slot_id        INTEGER NOT NULL REFERENCES content_slots(id) ON DELETE CASCADE,
        rotation_order INTEGER NOT NULL DEFAULT 0,
        duration       INTEGER NOT NULL DEFAULT 5,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query("COMMIT");
    console.log("✅ All tables created successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
