
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const mysql = require("mysql2/promise");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

async function main() {
  // 1. Read the existing 117 records from the React file.
  const sourcePath = path.join(
    __dirname,
    "src",
    "FollowUpsJAS2026.jsx"
  );

  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      "src/FollowUpsJAS2026.jsx file nahi mili."
    );
  }

  const source = fs.readFileSync(sourcePath, "utf8");

  const match = source.match(
    /const RAW_RECORDS\s*=\s*(\[[\s\S]*?\]);/
  );

  if (!match) {
    throw new Error(
      "RAW_RECORDS nahi mila. Database mein koi change nahi kiya."
    );
  }

  // Parse the existing data array.
  const records = vm.runInNewContext(
    "(" + match[1] + ")"
  );

  if (!Array.isArray(records) || records.length !== 117) {
    throw new Error(
      `117 records expected the. Mile: ${
        records?.length ?? 0
      }. Import cancel kar diya.`
    );
  }

  // Validate record numbers before connecting to the database.
  const serialNumbers = records.map((r) => Number(r.sNo));

  if (
    serialNumbers.some(
      (n) => !Number.isInteger(n) || n < 1
    ) ||
    new Set(serialNumbers).size !== records.length
  ) {
    throw new Error(
      "S.No. missing ya duplicate hai. Import cancel kar diya."
    );
  }

  // 2. Read Railway MySQL connection settings.
  const connectionString =
    process.env.MYSQL_PUBLIC_URL ||
    process.env.MYSQL_URL;

  if (!connectionString) {
    throw new Error(
      ".env mein MYSQL_PUBLIC_URL ya MYSQL_URL nahi mila."
    );
  }

  const dbUrl = new URL(connectionString);

  if (!["mysql:", "mysql2:"].includes(dbUrl.protocol)) {
    throw new Error(
      "MySQL connection URL ka format check karein."
    );
  }

  const db = await mysql.createConnection({
    host: dbUrl.hostname,
    port: Number(dbUrl.port || 3306),
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: decodeURIComponent(
      dbUrl.pathname.replace(/^\//, "")
    ),
    ssl: { rejectUnauthorized: false },
    connectTimeout: 15000,
  });

  try {
    // 3. Create a separate table.
    // Existing requirements and tasks tables are not modified.
    await db.query(`
      CREATE TABLE IF NOT EXISTS follow_ups_jas2026 (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        s_no INT NOT NULL UNIQUE,
        shared_date VARCHAR(50),
        shared_time VARCHAR(50),
        requirement_name TEXT,
        assigned_ops_person VARCHAR(255),
        sales_person VARCHAR(255),
        client_name VARCHAR(255),
        requirement_status VARCHAR(100),
        trainer_name VARCHAR(255),
        trainer_contact_details TEXT,
        evaluation_call_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Convert values safely to text.
    const getValue = (record, key) => {
      const value = record[key];

      if (value === undefined || value === null) {
        return "";
      }

      return String(value);
    };

    // 4. Insert records using their actual field names.
    let inserted = 0;
    let skipped = 0;

    await db.beginTransaction();

    try {
      for (const record of records) {
        const [result] = await db.execute(
          `INSERT IGNORE INTO follow_ups_jas2026 (
            s_no,
            shared_date,
            shared_time,
            requirement_name,
            assigned_ops_person,
            sales_person,
            client_name,
            requirement_status,
            trainer_name,
            trainer_contact_details,
            evaluation_call_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(record.sNo),
            getValue(record, "date"),
            getValue(record, "time"),
            getValue(record, "requirement"),
            getValue(record, "ops"),
            getValue(record, "sales"),
            getValue(record, "client"),
            getValue(record, "status"),
            getValue(record, "trainer"),
            getValue(record, "contact"),
            getValue(record, "evaluation"),
          ]
        );

        if (result.affectedRows === 1) {
          inserted++;
        } else {
          skipped++;
        }
      }

      await db.commit();
    } catch (error) {
      await db.rollback();
      throw error;
    }

    // 5. Verify the final database row count.
    const [rows] = await db.query(
      "SELECT COUNT(*) AS total FROM follow_ups_jas2026"
    );

    console.log("----------------------------------");
    console.log("Follow-Ups import completed");
    console.log("Source records:", records.length);
    console.log("New records inserted:", inserted);
    console.log("Duplicate records skipped:", skipped);
    console.log("Total rows in Follow-Ups table:", rows[0].total);
    console.log("Existing Requirements table was not modified.");
    console.log("----------------------------------");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exitCode = 1;
});
