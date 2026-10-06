"use strict";

require("dotenv").config();

const xlsx = require("xlsx");
const mysql = require("mysql2/promise");

const EXCEL_FILE = "Ops OND Requirement Tracker.xlsx";

async function importExcel() {
  let pool;

  try {
    console.log("Reading Excel...");

    const workbook = xlsx.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(sheet, {
      defval: "",
    });

    console.log("Sheet:", sheetName);
    console.log("Excel rows:", rows.length);

    if (!rows.length) {
      console.log("No data found in Excel.");
      return;
    }

    let DATABASE_URL = process.env.MYSQL_URL;

    if (!DATABASE_URL) {
      throw new Error("MYSQL_URL missing from .env");
    }

    DATABASE_URL = DATABASE_URL.trim();

    if (DATABASE_URL.startsWith("railwaymysql://")) {
      DATABASE_URL = DATABASE_URL.replace(
        "railwaymysql://",
        "mysql://"
      );
    }

    const dbUrl = new URL(DATABASE_URL);

    pool = mysql.createPool({
      host: dbUrl.hostname,
      port: Number(dbUrl.port || 3306),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: "railway",
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 15000,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    console.log("Railway MySQL connected.");

    function excelDateToMySQL(value) {
      if (value === "" || value === null || value === undefined) {
        return null;
      }

      if (typeof value === "number") {
        const date = new Date(
          Math.round((value - 25569) * 86400 * 1000)
        );

        return date.toISOString().slice(0, 10);
      }

      return String(value).trim();
    }

    function excelTimeToMySQL(value) {
      if (value === "" || value === null || value === undefined) {
        return null;
      }

      if (typeof value === "number") {
        const totalSeconds = Math.round(
          value * 24 * 60 * 60
        );

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor(
          (totalSeconds % 3600) / 60
        );
        const seconds = totalSeconds % 60;

        return [
          String(hours).padStart(2, "0"),
          String(minutes).padStart(2, "0"),
          String(seconds).padStart(2, "0"),
        ].join(":");
      }

      return String(value).trim();
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        const sNo = row["S.No."];

        if (
          sNo === "" ||
          sNo === null ||
          sNo === undefined
        ) {
          skipped++;
          console.log("Skipped row without S.No.");
          continue;
        }

        const data = [
          sNo,
          excelDateToMySQL(
            row["Client Proposal Shared Date"]
          ),
          excelTimeToMySQL(
            row["Client Proposal Shared Time"]
          ),
          row["Requirenment Name"] || "",
          row[
            "Assigned OPS Person (Kamal, Tisha, Sneha, Abhishek)"
          ] || "",
          row[
            "Sales Person (Prabodh, Amit, Srishti, Rakhi)"
          ] || "",
          row["Client Name"] || "",
          row[
            "Requirement Status ( Served / Regret)"
          ] || "",
          row["Trainer Name"] || "",
          row[
            "Trainer Contact Details (Mail ID & Phn. No.)"
          ] || "",
          row[
            "Evaluation Call Status (Yes/No)"
          ] || "",
          row["Follow Up"] || "",
        ];

        // Check whether this S.No. already exists
        const [existing] = await pool.execute(
          "SELECT id FROM requirements WHERE s_no = ? LIMIT 1",
          [sNo]
        );

        if (existing.length > 0) {
          // UPDATE existing row
          await pool.execute(
            `
            UPDATE requirements
            SET
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
            WHERE s_no = ?
            `,
            [
              data[1],
              data[2],
              data[3],
              data[4],
              data[5],
              data[6],
              data[7],
              data[8],
              data[9],
              data[10],
              data[11],
              sNo,
            ]
          );

          updated++;
          console.log(`Updated S.No. ${sNo}`);
        } else {
          // INSERT new row
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
            data
          );

          inserted++;
          console.log(`Inserted S.No. ${sNo}`);
        }
      } catch (error) {
        skipped++;

        console.error(
          `Row ${row["S.No."]} failed:`,
          error.message
        );
      }
    }

    console.log("");
    console.log("==============================");
    console.log("SYNC COMPLETED");
    console.log("==============================");
    console.log("Excel rows:", rows.length);
    console.log("New rows inserted:", inserted);
    console.log("Existing rows updated:", updated);
    console.log("Skipped:", skipped);
    console.log("==============================");

  } catch (error) {
    console.error("");
    console.error("SYNC FAILED");
    console.error(error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

importExcel();