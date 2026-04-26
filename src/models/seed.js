require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool   = require("../config/db");

async function seed() {
  const client = await pool.connect();
  try {
    const principalHash = await bcrypt.hash("principal123", 12);
    const teacher1Hash  = await bcrypt.hash("teacher123",   12);
    const teacher2Hash  = await bcrypt.hash("teacher123",   12);

    await client.query(`
      INSERT INTO users (name, email, password_hash, role) VALUES
        ('Principal Admin',  'principal@school.com', $1, 'principal'),
        ('Teacher One',      'teacher1@school.com',  $2, 'teacher'),
        ('Teacher Two',      'teacher2@school.com',  $3, 'teacher')
      ON CONFLICT (email) DO NOTHING;
    `, [principalHash, teacher1Hash, teacher2Hash]);

    console.log("✅ Seed completed");
    console.log("   principal@school.com  / principal123");
    console.log("   teacher1@school.com   / teacher123");
    console.log("   teacher2@school.com   / teacher123");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
