#!/usr/bin/env node
/**
 * CONNECTION VERIFICATION SCRIPT
 * 
 * This script checks if all components are properly connected:
 * - Database connection
 * - Environment variables
 * - File upload directory
 * - Dependencies installation
 * - Port availability
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const net = require("net");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
};

async function checkEnvironmentVariables() {
  log.header("Checking Environment Variables");

  const required = [
    "PORT",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
  ];

  let allFound = true;
  required.forEach((key) => {
    if (process.env[key]) {
      log.success(`${key} = ${key === "JWT_SECRET" ? "***" : process.env[key]}`);
    } else {
      log.error(`${key} is missing`);
      allFound = false;
    }
  });

  return allFound;
}

async function checkDatabaseConnection() {
  log.header("Checking Database Connection");

  try {
    const { Pool } = require("pg");

    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    pool.end();

    log.success(`Connected to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    log.success(`Database: ${process.env.DB_NAME}`);
    return true;
  } catch (err) {
    log.error(`Database connection failed: ${err.message}`);
    log.info("Make sure PostgreSQL is running and credentials are correct");
    return false;
  }
}

async function checkDatabaseTables() {
  log.header("Checking Database Tables");

  try {
    const { Pool } = require("pg");

    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    const client = await pool.connect();

    const tables = ["users", "content", "content_slots", "content_schedule"];
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const existingTables = result.rows.map((r) => r.table_name);

    tables.forEach((table) => {
      if (existingTables.includes(table)) {
        log.success(`Table '${table}' exists`);
      } else {
        log.warning(`Table '${table}' not found - run: npm run db:migrate`);
      }
    });

    client.release();
    pool.end();
    return true;
  } catch (err) {
    log.error(`Could not check tables: ${err.message}`);
    return false;
  }
}

function checkFileUploadDirectory() {
  log.header("Checking File Upload Directory");

  const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || "src/uploads");

  if (fs.existsSync(uploadDir)) {
    log.success(`Upload directory exists: ${uploadDir}`);

    try {
      const testFile = path.join(uploadDir, ".write-test");
      fs.writeFileSync(testFile, "test");
      fs.unlinkSync(testFile);
      log.success("Directory is writable");
      return true;
    } catch (err) {
      log.error(`Directory is not writable: ${err.message}`);
      return false;
    }
  } else {
    log.warning(`Upload directory not found: ${uploadDir}`);
    log.info("Creating directory...");
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      log.success("Directory created");
      return true;
    } catch (err) {
      log.error(`Failed to create directory: ${err.message}`);
      return false;
    }
  }
}

function checkDependencies() {
  log.header("Checking NPM Dependencies");

  const required = [
    "express",
    "pg",
    "dotenv",
    "bcryptjs",
    "jsonwebtoken",
    "multer",
    "cors",
  ];

  const nodeModules = path.join(__dirname, "node_modules");

  if (!fs.existsSync(nodeModules)) {
    log.error("node_modules not found");
    log.info("Run: npm install");
    return false;
  }

  let allFound = true;
  required.forEach((pkg) => {
    const pkgPath = path.join(nodeModules, pkg);
    if (fs.existsSync(pkgPath)) {
      log.success(`${pkg} installed`);
    } else {
      log.error(`${pkg} not found`);
      allFound = false;
    }
  });

  return allFound;
}

function checkPortAvailability() {
  log.header("Checking Port Availability");

  return new Promise((resolve) => {
    const port = process.env.PORT || 5000;
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        log.warning(`Port ${port} is already in use`);
        log.info(
          `Either: 1) Kill process using port ${port}, or 2) Change PORT in .env`
        );
        resolve(false);
      } else {
        log.error(`Port check failed: ${err.message}`);
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      log.success(`Port ${port} is available`);
      resolve(true);
    });

    server.listen(port);
  });
}

async function runAllChecks() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║     CBS - Connection Verification Script         ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

  const checks = [
    { name: "Environment Variables", fn: checkEnvironmentVariables },
    { name: "Dependencies", fn: checkDependencies },
    { name: "Port Availability", fn: checkPortAvailability },
    { name: "File Upload Directory", fn: checkFileUploadDirectory },
    { name: "Database Connection", fn: checkDatabaseConnection },
    { name: "Database Tables", fn: checkDatabaseTables },
  ];

  const results = [];

  for (const check of checks) {
    try {
      const result = await check.fn();
      results.push({ name: check.name, passed: result });
    } catch (err) {
      log.error(`${check.name} check error: ${err.message}`);
      results.push({ name: check.name, passed: false });
    }
  }

  // Summary
  log.header("Summary");
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log(`\nPassed: ${passed}/${total}\n`);

  results.forEach((r) => {
    const icon = r.passed ? "✅" : "❌";
    console.log(`${icon} ${r.name}`);
  });

  if (passed === total) {
    console.log(
      `\n${colors.green}✨ All checks passed! You're ready to start.${colors.reset}`
    );
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  1. npm run db:migrate   (Create database tables)`);
    console.log(`  2. npm run dev           (Start development server)`);
    console.log(`  3. Open Postman and import postman-collection.json\n`);
    process.exit(0);
  } else {
    console.log(
      `\n${colors.yellow}⚠️  Some checks failed. Please fix the issues above.${colors.reset}\n`
    );
    process.exit(1);
  }
}

// Run verification
runAllChecks().catch((err) => {
  log.error(`Verification script failed: ${err.message}`);
  process.exit(1);
});
