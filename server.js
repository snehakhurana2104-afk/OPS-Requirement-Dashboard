"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   MYSQL CONNECTION
========================================================= */

// Railway Public URL first
// MYSQL_URL kept as fallback for local development
let DATABASE_URL =
  process.env.MYSQL_PUBLIC_URL ||
  process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;

if (!DATABASE_URL) {
  throw new Error(
    "MYSQL_PUBLIC_URL or MYSQL_URL missing from environment variables"
  );
}

DATABASE_URL = DATABASE_URL.trim();

if (DATABASE_URL.startsWith("railwaymysql://")) {
  DATABASE_URL = DATABASE_URL.replace(
    "railwaymysql://",
    "mysql://"
  );
}

if (!DATABASE_URL.startsWith("mysql://")) {
  throw new Error(
    "MYSQL_PUBLIC_URL / MYSQL_URL must start with mysql://"
  );
}

let dbUrl;

try {
  dbUrl = new URL(DATABASE_URL);
} catch (error) {
  throw new Error(
    "Invalid MYSQL_PUBLIC_URL / MYSQL_URL"
  );
}

const DB_HOST = dbUrl.hostname;
const DB_PORT = Number(dbUrl.port || 3306);
const DB_USER = decodeURIComponent(dbUrl.username);
const DB_PASSWORD = decodeURIComponent(dbUrl.password);

// Railway database
const DB_NAME =
  dbUrl.pathname.replace("/", "") || "railway";

/* =========================================================
   MYSQL POOL
========================================================= */

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 15000,

  ssl: {
    rejectUnauthorized: false,
  },
});

/* =========================================================
   DATABASE TEST
========================================================= */

async function testDatabase() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

/* =========================================================
   DB → FRONTEND MAPPING
========================================================= */

function mapRequirement(row) {
  return {
    id: row.id,

    sNo: row.s_no,

    clientProposalSharedDate:
      row.client_proposal_shared_date,

    clientProposalSharedTime:
      row.client_proposal_shared_time,

    requirementName:
      row.requirement_name || "",

    assignedOpsPerson:
      row.assigned_ops_person || "",

    salesPerson:
      row.sales_person || "",

    clientName:
      row.client_name || "",

    requirementStatus:
      row.requirement_status || "",

    trainerName:
      row.trainer_name || "",

    trainerContactDetails:
      row.trainer_contact_details || "",

    evaluationCallStatus:
      row.evaluation_call_status || "",

    followUp:
      row.follow_up || "",
  };
}

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "OPS Requirement Dashboard API is running",
    database: "Railway MySQL",
  });
});

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", async (req, res) => {
  try {
    await testDatabase();

    res.json({
      success: true,
      message: "API and MySQL are working",
      database: DB_NAME,
      host: DB_HOST,
      port: DB_PORT,
    });
  } catch (error) {
    console.error(
      "Health check failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "MySQL connection failed",
      error: error.message,
    });
  }
});

/* =========================================================
   TEST DATABASE
========================================================= */

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM requirements"
    );

    res.json({
      success: true,
      message: "MySQL working",
      database: DB_NAME,
      totalRequirements: Number(rows[0].total),
    });
  } catch (error) {
    console.error(
      "Test DB error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Database test failed",
      error: error.message,
    });
  }
});

/* =========================================================
   GET ALL REQUIREMENTS
========================================================= */

app.get("/api/requirements", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        id,
        s_no,
        client_proposal_shared_date,
        client_proposal_shared_time,
        requirement_name,
        assigned_ops_person,
        sales_person,
        client_name,
        requirement_status,
        trainer_name,
        trainer_contact_details,
        evaluation_call_status,
        follow_up
      FROM requirements
      ORDER BY id ASC
    `);

    const requirements = rows.map(mapRequirement);

    res.json({
      success: true,
      count: requirements.length,
      data: requirements,
    });
  } catch (error) {
    console.error(
      "GET /api/requirements error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch requirements",
      error: error.message,
    });
  }
});

/* =========================================================
   GET SINGLE REQUIREMENT
========================================================= */

app.get("/api/requirements/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid requirement ID",
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT *
      FROM requirements
      WHERE id = ?
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    res.json({
      success: true,
      data: mapRequirement(rows[0]),
    });
  } catch (error) {
    console.error(
      "GET /api/requirements/:id error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch requirement",
      error: error.message,
    });
  }
});

/* =========================================================
   CREATE REQUIREMENT
========================================================= */

app.post("/api/requirements", async (req, res) => {
  try {
    const {
      sNo,
      clientProposalSharedDate,
      clientProposalSharedTime,
      requirementName,
      assignedOpsPerson,
      salesPerson,
      clientName,
      requirementStatus,
      trainerName,
      trainerContactDetails,
      evaluationCallStatus,
      followUp,
    } = req.body;

    const [result] = await pool.execute(
      `
      INSERT INTO requirements (
        s_no,
        client_proposal_shared_date,
        client_proposal_shared_time,
        requirement_name,
        assigned_ops_person,
        sales_person,
        client_name,
        requirement_status,
        trainer_name,
        trainer_contact_details,
        evaluation_call_status,
        follow_up
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sNo || null,
        clientProposalSharedDate || null,
        clientProposalSharedTime || null,
        requirementName || "",
        assignedOpsPerson || "",
        salesPerson || "",
        clientName || "",
        requirementStatus || "",
        trainerName || "",
        trainerContactDetails || "",
        evaluationCallStatus || "",
        followUp || "",
      ]
    );

    const [rows] = await pool.execute(
      "SELECT * FROM requirements WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Requirement created successfully",
      data: mapRequirement(rows[0]),
    });
  } catch (error) {
    console.error(
      "POST /api/requirements error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to create requirement",
      error: error.message,
    });
  }
});

/* =========================================================
   UPDATE REQUIREMENT
========================================================= */

app.put("/api/requirements/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid requirement ID",
      });
    }

    const {
      sNo,
      clientProposalSharedDate,
      clientProposalSharedTime,
      requirementName,
      assignedOpsPerson,
      salesPerson,
      clientName,
      requirementStatus,
      trainerName,
      trainerContactDetails,
      evaluationCallStatus,
      followUp,
    } = req.body;

    const [result] = await pool.execute(
      `
      UPDATE requirements
      SET
        s_no = ?,
        client_proposal_shared_date = ?,
        client_proposal_shared_time = ?,
        requirement_name = ?,
        assigned_ops_person = ?,
        sales_person = ?,
        client_name = ?,
        requirement_status = ?,
        trainer_name = ?,
        trainer_contact_details = ?,
        evaluation_call_status = ?,
        follow_up = ?
      WHERE id = ?
      `,
      [
        sNo || null,
        clientProposalSharedDate || null,
        clientProposalSharedTime || null,
        requirementName || "",
        assignedOpsPerson || "",
        salesPerson || "",
        clientName || "",
        requirementStatus || "",
        trainerName || "",
        trainerContactDetails || "",
        evaluationCallStatus || "",
        followUp || "",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    const [rows] = await pool.execute(
      "SELECT * FROM requirements WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Requirement updated successfully",
      data: mapRequirement(rows[0]),
    });
  } catch (error) {
    console.error(
      "PUT /api/requirements/:id error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update requirement",
      error: error.message,
    });
  }
});

/* =========================================================
   DELETE REQUIREMENT
========================================================= */

app.delete("/api/requirements/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid requirement ID",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM requirements WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    res.json({
      success: true,
      message: "Requirement deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/requirements/:id error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete requirement",
      error: error.message,
    });
  }
});

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await testDatabase();

    console.log("");
    console.log("========================================");
    console.log("   OPS REQUIREMENT DASHBOARD API");
    console.log("========================================");
    console.log("Database: Railway MySQL");
    console.log("Host:", DB_HOST);
    console.log("Port:", DB_PORT);
    console.log("Database:", DB_NAME);
    console.log("========================================");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("");
      console.log(
        `API running on port ${PORT}`
      );

      console.log(
        `Requirements: /api/requirements`
      );

      console.log(
        `DB Test: /api/test-db`
      );

      console.log("");
    });
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("   SERVER START FAILED");
    console.error("========================================");
    console.error(error.message);
    console.error("========================================");

    process.exit(1);
  }
}

startServer();