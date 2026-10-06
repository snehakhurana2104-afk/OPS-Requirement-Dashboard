"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT =
  process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   MYSQL
========================================================= */

let DATABASE_URL =
  process.env.MYSQL_PUBLIC_URL ||
  process.env.MYSQL_URL;

if (!DATABASE_URL) {
  throw new Error(
    "MYSQL_PUBLIC_URL or MYSQL_URL missing from environment variables"
  );
}

DATABASE_URL =
  DATABASE_URL.trim();

if (
  DATABASE_URL.startsWith(
    "railwaymysql://"
  )
) {
  DATABASE_URL =
    DATABASE_URL.replace(
      "railwaymysql://",
      "mysql://"
    );
}

if (
  !DATABASE_URL.startsWith(
    "mysql://"
  )
) {
  throw new Error(
    "MYSQL_PUBLIC_URL / MYSQL_URL must start with mysql://"
  );
}

const dbUrl =
  new URL(DATABASE_URL);

const DB_HOST =
  dbUrl.hostname;

const DB_PORT =
  Number(
    dbUrl.port || 3306
  );

const DB_USER =
  decodeURIComponent(
    dbUrl.username
  );

const DB_PASSWORD =
  decodeURIComponent(
    dbUrl.password
  );

const DB_NAME =
  dbUrl.pathname.replace(
    "/",
    ""
  ) || "railway";

const pool =
  mysql.createPool({
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
   EXCEL
========================================================= */

const EXCEL_FILE =
  process.env.EXCEL_FILE ||
  path.join(
    process.cwd(),
    "Ops OND Requirement Tracker.xlsx"
  );

/* =========================================================
   DATABASE SETUP
========================================================= */

async function setupTasksTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,

      requirement_id INT NULL,

      s_no VARCHAR(100),

      client_proposal_shared_date DATE NULL,
      client_proposal_shared_time TIME NULL,

      requirement_name TEXT,
      assigned_ops_person VARCHAR(255),
      sales_person VARCHAR(255),
      client_name VARCHAR(255),
      requirement_status VARCHAR(100),

      trainer_name VARCHAR(255),
      trainer_contact_details TEXT,

      evaluation_call_status VARCHAR(50),

      follow_up_1 VARCHAR(100),
      follow_up_2 VARCHAR(100),
      follow_up_3 VARCHAR(100),

      task_title VARCHAR(255) NOT NULL,
      task_description TEXT,

      due_date DATE NULL,

      task_status VARCHAR(50)
        DEFAULT 'Pending',

      created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  console.log(
    "Tasks table ready."
  );
}

/* =========================================================
   HELPERS
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

function mapTask(row) {
  return {
    id: row.id,

    requirementId:
      row.requirement_id,

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

    followUp1:
      row.follow_up_1 || "",

    followUp2:
      row.follow_up_2 || "",

    followUp3:
      row.follow_up_3 || "",

    taskTitle:
      row.task_title || "",

    taskDescription:
      row.task_description || "",

    dueDate:
      row.due_date,

    taskStatus:
      row.task_status ||
      "Pending",

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/* =========================================================
   EXCEL TASK SYNC
========================================================= */

function appendTaskToExcel(task) {
  try {
    let workbook;

    if (
      fs.existsSync(
        EXCEL_FILE
      )
    ) {
      workbook =
        xlsx.readFile(
          EXCEL_FILE
        );
    } else {
      workbook =
        xlsx.utils.book_new();
    }

    const sheetName =
      "Tasks";

    const taskRow = {
      "Task ID":
        task.id,

      "Requirement ID":
        task.requirementId || "",

      "S.No.":
        task.sNo || "",

      "Client Proposal Shared Date":
        task.clientProposalSharedDate ||
        "",

      "Client Proposal Shared Time":
        task.clientProposalSharedTime ||
        "",

      "Requirement Name":
        task.requirementName ||
        "",

      "Assigned OPS Person":
        task.assignedOpsPerson ||
        "",

      "Sales Person":
        task.salesPerson ||
        "",

      "Client Name":
        task.clientName ||
        "",

      "Requirement Status":
        task.requirementStatus ||
        "",

      "Trainer Name":
        task.trainerName ||
        "",

      "Trainer Contact Details":
        task.trainerContactDetails ||
        "",

      "Evaluation Call Status":
        task.evaluationCallStatus ||
        "",

      "Follow Up 1":
        task.followUp1 || "",

      "Follow Up 2":
        task.followUp2 || "",

      "Follow Up 3":
        task.followUp3 || "",

      "Task Title":
        task.taskTitle || "",

      "Task Description":
        task.taskDescription ||
        "",

      "Due Date":
        task.dueDate || "",

      "Task Status":
        task.taskStatus ||
        "Pending",

      "Created At":
        task.createdAt || "",
    };

    let worksheet;

    if (
      workbook.Sheets[
        sheetName
      ]
    ) {
      worksheet =
        workbook.Sheets[
          sheetName
        ];

      const existing =
        xlsx.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
          }
        );

      existing.push(taskRow);

      worksheet =
        xlsx.utils.json_to_sheet(
          existing
        );

      workbook.Sheets[
        sheetName
      ] = worksheet;
    } else {
      worksheet =
        xlsx.utils.json_to_sheet(
          [taskRow]
        );

      xlsx.utils.book_append_sheet(
        workbook,
        worksheet,
        sheetName
      );
    }

    xlsx.writeFile(
      workbook,
      EXCEL_FILE
    );

    console.log(
      "Task written to Excel:",
      EXCEL_FILE
    );

    return true;
  } catch (error) {
    console.error(
      "Excel task update failed:",
      error.message
    );

    return false;
  }
}

/* =========================================================
   ROOT
========================================================= */

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "OPS Requirement Dashboard API is running",
      database:
        "Railway MySQL",
    });
  }
);

/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  async (req, res) => {
    try {
      const connection =
        await pool.getConnection();

      try {
        await connection.ping();
      } finally {
        connection.release();
      }

      res.json({
        success: true,
        message:
          "API and MySQL are working",
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
        message:
          "MySQL connection failed",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   REQUIREMENTS GET
========================================================= */

app.get(
  "/api/requirements",
  async (req, res) => {
    try {
      const [rows] =
        await pool.execute(`
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

      const requirements =
        rows.map(
          mapRequirement
        );

      res.json({
        success: true,
        count:
          requirements.length,
        data:
          requirements,
      });
    } catch (error) {
      console.error(
        "GET requirements:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch requirements",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   CREATE REQUIREMENT
========================================================= */

app.post(
  "/api/requirements",
  async (req, res) => {
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

      const [result] =
        await pool.execute(
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
            clientProposalSharedDate ||
              null,
            clientProposalSharedTime ||
              null,
            requirementName || "",
            assignedOpsPerson || "",
            salesPerson || "",
            clientName || "",
            requirementStatus || "",
            trainerName || "",
            trainerContactDetails ||
              "",
            evaluationCallStatus ||
              "",
            followUp || "",
          ]
        );

      const [rows] =
        await pool.execute(
          "SELECT * FROM requirements WHERE id = ?",
          [result.insertId]
        );

      res.status(201).json({
        success: true,
        message:
          "Requirement created successfully",
        data:
          mapRequirement(
            rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "POST requirements:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create requirement",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   UPDATE REQUIREMENT
========================================================= */

app.put(
  "/api/requirements/:id",
  async (req, res) => {
    try {
      const id =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid requirement ID",
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

      const [result] =
        await pool.execute(
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
            clientProposalSharedDate ||
              null,
            clientProposalSharedTime ||
              null,
            requirementName || "",
            assignedOpsPerson || "",
            salesPerson || "",
            clientName || "",
            requirementStatus || "",
            trainerName || "",
            trainerContactDetails ||
              "",
            evaluationCallStatus ||
              "",
            followUp || "",
            id,
          ]
        );

      if (
        !result.affectedRows
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Requirement not found",
          });
      }

      const [rows] =
        await pool.execute(
          "SELECT * FROM requirements WHERE id = ?",
          [id]
        );

      res.json({
        success: true,
        message:
          "Requirement updated successfully",
        data:
          mapRequirement(
            rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "PUT requirements:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update requirement",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   DELETE REQUIREMENT
========================================================= */

app.delete(
  "/api/requirements/:id",
  async (req, res) => {
    try {
      const id =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid requirement ID",
          });
      }

      const [result] =
        await pool.execute(
          "DELETE FROM requirements WHERE id = ?",
          [id]
        );

      if (
        !result.affectedRows
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Requirement not found",
          });
      }

      res.json({
        success: true,
        message:
          "Requirement deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE requirements:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete requirement",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   GET TASKS
========================================================= */

app.get(
  "/api/tasks",
  async (req, res) => {
    try {
      const [rows] =
        await pool.execute(`
          SELECT *
          FROM tasks
          ORDER BY id DESC
        `);

      res.json({
        success: true,
        count:
          rows.length,
        data:
          rows.map(mapTask),
      });
    } catch (error) {
      console.error(
        "GET tasks:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch tasks",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   CREATE TASK
========================================================= */

app.post(
  "/api/tasks",
  async (req, res) => {
    try {
      const {
        requirementId,

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

        followUp1,
        followUp2,
        followUp3,

        taskTitle,
        taskDescription,

        dueDate,
        taskStatus,
      } = req.body;

      if (
        !taskTitle ||
        !String(
          taskTitle
        ).trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Task title is required",
          });
      }

      const [result] =
        await pool.execute(
          `
          INSERT INTO tasks (
            requirement_id,
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
            follow_up_1,
            follow_up_2,
            follow_up_3,
            task_title,
            task_description,
            due_date,
            task_status
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
          `,
          [
            requirementId ||
              null,

            sNo || "",

            clientProposalSharedDate ||
              null,

            clientProposalSharedTime ||
              null,

            requirementName || "",

            assignedOpsPerson || "",

            salesPerson || "",

            clientName || "",

            requirementStatus || "",

            trainerName || "",

            trainerContactDetails ||
              "",

            evaluationCallStatus ||
              "",

            followUp1 || "",

            followUp2 || "",

            followUp3 || "",

            String(
              taskTitle
            ).trim(),

            taskDescription || "",

            dueDate || null,

            taskStatus ||
              "Pending",
          ]
        );

      const [rows] =
        await pool.execute(
          "SELECT * FROM tasks WHERE id = ?",
          [result.insertId]
        );

      const task =
        mapTask(rows[0]);

      const excelUpdated =
        appendTaskToExcel(
          task
        );

      res.status(201).json({
        success: true,

        message:
          "Task created successfully",

        excelUpdated,

        data: task,
      });
    } catch (error) {
      console.error(
        "POST tasks:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create task",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   UPDATE TASK STATUS
========================================================= */

app.put(
  "/api/tasks/:id",
  async (req, res) => {
    try {
      const id =
        Number(
          req.params.id
        );

      const {
        taskStatus,
      } = req.body;

      if (
        !Number.isInteger(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid task ID",
          });
      }

      await pool.execute(
        `
        UPDATE tasks
        SET task_status = ?
        WHERE id = ?
        `,
        [
          taskStatus ||
            "Pending",
          id,
        ]
      );

      const [rows] =
        await pool.execute(
          "SELECT * FROM tasks WHERE id = ?",
          [id]
        );

      if (!rows.length) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Task not found",
          });
      }

      res.json({
        success: true,
        message:
          "Task updated successfully",
        data:
          mapTask(
            rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "PUT task:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update task",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   404
========================================================= */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "API route not found",
      path:
        req.originalUrl,
    });
  }
);

/* =========================================================
   START
========================================================= */

async function startServer() {
  try {
    const connection =
      await pool.getConnection();

    try {
      await connection.ping();
    } finally {
      connection.release();
    }

    await setupTasksTable();

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "   OPS REQUIREMENT DASHBOARD API"
    );
    console.log(
      "========================================"
    );

    console.log(
      "Database:",
      DB_NAME
    );

    console.log(
      "Host:",
      DB_HOST
    );

    console.log(
      "Port:",
      DB_PORT
    );

    console.log(
      "Excel:",
      EXCEL_FILE
    );

    console.log(
      "========================================"
    );

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `API running on port ${PORT}`
        );

        console.log(
          "Requirements: /api/requirements"
        );

        console.log(
          "Tasks: /api/tasks"
        );
      }
    );
  } catch (error) {
    console.error("");
    console.error(
      "SERVER START FAILED"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
}

startServer();