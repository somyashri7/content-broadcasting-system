const bcrypt   = require("bcryptjs");
const pool     = require("../config/db");
const { signToken }    = require("../utils/jwt");
const { success, error } = require("../utils/response");

// POST /auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return error(res, "name, email, password, and role are required", 400);
    }
    if (!["principal", "teacher"].includes(role)) {
      return error(res, "role must be 'principal' or 'teacher'", 400);
    }
    if (password.length < 6) {
      return error(res, "Password must be at least 6 characters", 400);
    }

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length > 0) return error(res, "Email already registered", 409);

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, created_at",
      [name, email.toLowerCase(), hash, role]
    );

    const user  = result.rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return success(res, { user, token }, "Registered successfully", 201);
  } catch (err) {
    console.error("register error:", err.message);
    return error(res, "Registration failed");
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, "email and password are required", 400);

    const result = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) return error(res, "Invalid credentials", 401);

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return error(res, "Invalid credentials", 401);

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const { password_hash, ...safeUser } = user;

    return success(res, { user: safeUser, token }, "Login successful");
  } catch (err) {
    console.error("login error:", err.message);
    return error(res, "Login failed");
  }
};

// GET /auth/me
const me = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return error(res, "User not found", 404);
    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, "Could not fetch user");
  }
};

module.exports = { register, login, me };
