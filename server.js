"use strict";

// ==========================================================
// IMPORTS
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");
const { exec } = require("child_process");

// ==========================================================
// APP CONFIGURATION
// ==========================================================

const app = express();

const PORT = 5000;

const EXCEL_FILE =
  "C:\\Users\\Senha\\OneDrive\\Ops OND Requirement Tracker.xlsx";

// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors());
app.use(express.json());

// ==========================================================
// READ ALL DATA FROM EXCEL
// ==========================================================

function readRequirementsFromExcel() {
  const workbook = XLSX.readFile(EXCEL_FILE, {
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (!rows || rows.length <= 1) {
    return [];
  }

  return rows
    .slice(1)
    .filter((row) => {
      return row.some(
        (cell) => String(cell ?? "").trim() !== ""
      );
    })
    .map((row, index) => ({
      sNo:
        String(row[0] ?? "").trim() ||
        String(index + 1),

      clientProposalSharedDate:
        String(row[1] ?? "").trim(),

      clientProposalSharedTime:
        String(row[2] ?? "").trim(),

      requirementName:
        String(row[3] ?? "").trim(),

      assignedOpsPerson:
        String(row[4] ?? "").trim(),

      salesPerson:
        String(row[5] ?? "").trim(),

      clientName:
        String(row[6] ?? "").trim(),

      requirementStatus:
        String(row[7] ?? "").trim(),

      trainerName:
        String(row[8] ?? "").trim(),

      trainerContactDetails:
        String(row[9] ?? "").trim(),

      evaluationCallStatus:
        String(row[10] ?? "").trim(),

      followUp:
        String(row[11] ?? "").trim(),
    }));
}

// ==========================================================
// NORMALIZE TEXT
// ==========================================================

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

// ==========================================================
// UNIQUE VALUES
// ==========================================================

function getUniqueValues(data, field) {
  return [
    ...new Set(
      data
        .map((item) =>
          String(item[field] || "").trim()
        )
        .filter(Boolean)
    ),
  ];
}

// ==========================================================
// DATE HELPERS
// ==========================================================

function normalizeDateForComparison(value) {
  const text = String(value || "").trim();

  if (!text) {
    return null;
  }

  // --------------------------------------------------------
  // DD-MM-YYYY / DD/MM/YYYY
  // --------------------------------------------------------

  let match = text.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
  );

  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];

    return `${year}-${month}-${day}`;
  }

  // --------------------------------------------------------
  // YYYY-MM-DD / YYYY/MM/DD
  // --------------------------------------------------------

  match = text.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
  );

  if (match) {
    const year = match[1];

    const month = match[2].padStart(2, "0");

    const day = match[3].padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // --------------------------------------------------------
  // DD-MMM-YY / DD-MMM-YYYY
  // Example: 22-Sep-26
  // --------------------------------------------------------

  match = text.match(
    /^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})$/
  );

  if (match) {
    const day = parseInt(match[1], 10);

    const monthText =
      match[2].toLowerCase();

    const months = {
      jan: 1,
      january: 1,

      feb: 2,
      february: 2,

      mar: 3,
      march: 3,

      apr: 4,
      april: 4,

      may: 5,

      jun: 6,
      june: 6,

      jul: 7,
      july: 7,

      aug: 8,
      august: 8,

      sep: 9,
      sept: 9,
      september: 9,

      oct: 10,
      october: 10,

      nov: 11,
      november: 11,

      dec: 12,
      december: 12,
    };

    const month = months[monthText];

    let year = parseInt(match[3], 10);

    if (year < 100) {
      year += 2000;
    }

    if (
      month &&
      day >= 1 &&
      day <= 31
    ) {
      return (
        `${year}-` +
        `${String(month).padStart(2, "0")}-` +
        `${String(day).padStart(2, "0")}`
      );
    }
  }

  return null;
}

// ==========================================================
// TODAY
// ==========================================================

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,

    message:
      "Requirement Dashboard API is running",

    copilot:
      "Local Excel Copilot - No OpenAI API",

    excel:
      EXCEL_FILE,

    excelOpen:
      "Enabled",

    exportMode:
      "Open Excel - No Download",
  });
});

// ==========================================================
// GET ALL REQUIREMENTS
// ==========================================================

app.get("/api/requirements", (req, res) => {
  try {
    const data =
      readRequirementsFromExcel();

    res.json({
      success: true,

      count: data.length,

      data,
    });
  } catch (error) {
    console.error(
      "Excel Read Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Unable to read Excel file",

      error:
        error.message,
    });
  }
});

// ==========================================================
// OPEN CONNECTED EXCEL FILE
// ==========================================================
// IMPORTANT:
// This does NOT download the Excel file.
// It opens the actual Excel file on the
// computer where Node.js server is running.
// ==========================================================

app.get("/api/open-excel", (req, res) => {
  try {
    console.log(
      "Opening connected Excel file..."
    );

    console.log(
      `Excel: ${EXCEL_FILE}`
    );

    exec(
      `start "" "${EXCEL_FILE}"`,
      (error) => {
        if (error) {
          console.error(
            "Excel Open Error:",
            error
          );

          if (!res.headersSent) {
            return res.status(500).json({
              success: false,

              message:
                "Excel file open nahi ho pa rahi.",

              error:
                error.message,
            });
          }

          return;
        }

        console.log(
          "Excel file opened successfully."
        );

        return res.json({
          success: true,

          message:
            "Excel file opened successfully.",

          file:
            EXCEL_FILE,
        });
      }
    );
  } catch (error) {
    console.error(
      "Excel Open Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to open Excel file.",

      error:
        error.message,
    });
  }
});

// ==========================================================
// EXPORT BUTTON ROUTE
// ==========================================================
// Kept as /api/export so existing frontend can use it.
// It opens Excel instead of downloading.
// ==========================================================

app.get("/api/export", (req, res) => {
  try {
    console.log(
      "Export button clicked."
    );

    console.log(
      "Opening actual Excel file..."
    );

    // First make sure file can be read.
    XLSX.readFile(EXCEL_FILE);

    exec(
      `start "" "${EXCEL_FILE}"`,
      (error) => {
        if (error) {
          console.error(
            "Excel Open Error:",
            error
          );

          if (!res.headersSent) {
            return res.status(500).json({
              success: false,

              message:
                "Excel file open nahi ho pa rahi.",

              error:
                error.message,
            });
          }

          return;
        }

        console.log(
          "Excel opened from Export button."
        );

        return res.json({
          success: true,

          message:
            "Excel file opened successfully.",

          mode:
            "open",

          file:
            EXCEL_FILE,
        });
      }
    );
  } catch (error) {
    console.error(
      "Excel Export/Open Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to open Excel file.",

      error:
        error.message,
    });
  }
});

// ==========================================================
// FREE LOCAL AI COPILOT
// NO OPENAI API
// NO API CREDITS
// ANSWERS FROM LIVE EXCEL DATA
// ==========================================================

app.post("/api/copilot", (req, res) => {
  try {
    const rawQuestion =
      String(
        req.body?.question || ""
      ).trim();

    if (!rawQuestion) {
      return res.status(400).json({
        success: false,

        answer:
          "Please ask a question about your requirements.",
      });
    }

    const question =
      normalizeText(
        rawQuestion
      );

    // ------------------------------------------------------
    // READ LATEST EXCEL DATA
    // ------------------------------------------------------

    const requirements =
      readRequirementsFromExcel();

    if (!requirements.length) {
      return res.json({
        success: true,

        answer:
          "Excel file me abhi koi requirement data available nahi hai.",
      });
    }

    // ------------------------------------------------------
    // BASIC COUNTS
    // ------------------------------------------------------

    const total =
      requirements.length;

    const served =
      requirements.filter(
        (item) =>
          normalizeText(
            item.requirementStatus
          ).includes("served")
      ).length;

    const regret =
      requirements.filter(
        (item) =>
          normalizeText(
            item.requirementStatus
          ).includes("regret")
      ).length;

    const evaluationCalls =
      requirements.filter(
        (item) => {
          const value =
            normalizeText(
              item.evaluationCallStatus
            );

          return [
            "yes",
            "y",
            "done",
            "completed",
            "complete",
          ].includes(value);
        }
      ).length;

    const followUps =
      requirements.filter(
        (item) =>
          String(
            item.followUp || ""
          ).trim() !== ""
      ).length;

    const clients =
      getUniqueValues(
        requirements,
        "clientName"
      );

    const opsPersons =
      getUniqueValues(
        requirements,
        "assignedOpsPerson"
      );

    const salesPersons =
      getUniqueValues(
        requirements,
        "salesPerson"
      );

    // ======================================================
    // SUMMARY
    // ======================================================

    if (
      question.includes("summary") ||
      question.includes("overview") ||
      question.includes("dashboard summary") ||
      question.includes("complete summary") ||
      question.includes("overall")
    ) {
      return res.json({
        success: true,

        answer:
          `OPS Requirement Summary\n\n` +
          `Total Requirements: ${total}\n` +
          `Served: ${served}\n` +
          `Regret: ${regret}\n` +
          `Follow Ups: ${followUps}\n` +
          `Evaluation Calls: ${evaluationCalls}\n` +
          `Total Clients: ${clients.length}\n` +
          `OPS Persons: ${opsPersons.length}\n` +
          `Sales Persons: ${salesPersons.length}`,
      });
    }

    // ======================================================
    // TOTAL REQUIREMENTS
    // ======================================================

    if (
      question.includes(
        "total requirement"
      ) ||
      question.includes(
        "total requirements"
      ) ||
      question.includes(
        "how many requirements"
      ) ||
      question.includes(
        "kitni requirement"
      ) ||
      question.includes(
        "kitne requirement"
      ) ||
      question.includes(
        "requirements kitni"
      ) ||
      question.includes(
        "requirements kitne"
      )
    ) {
      return res.json({
        success: true,

        answer:
          `Total requirements: ${total}`,
      });
    }

    // ======================================================
    // SERVED + REGRET
    // ======================================================

    if (
      (
        question.includes("served") &&
        question.includes("regret")
      ) ||
      question.includes(
        "served vs regret"
      ) ||
      question.includes(
        "served aur regret"
      ) ||
      question.includes(
        "served or regret"
      ) ||
      question.includes(
        "served ya regret"
      )
    ) {
      return res.json({
        success: true,

        answer:
          `Total Requirements: ${total}\n` +
          `Served: ${served}\n` +
          `Regret: ${regret}`,
      });
    }

    // ======================================================
    // SERVED
    // ======================================================

    if (
      question.includes("served") ||
      question.includes("serve hui") ||
      question.includes("serve kitni")
    ) {
      return res.json({
        success: true,

        answer:
          `Served requirements: ${served}`,
      });
    }

    // ======================================================
    // REGRET
    // ======================================================

    if (
      question.includes("regret") ||
      question.includes(
        "regret kitni"
      ) ||
      question.includes(
        "regret requirements"
      )
    ) {
      return res.json({
        success: true,

        answer:
          `Regret requirements: ${regret}`,
      });
    }

    // ======================================================
    // EVALUATION CALL
    // ======================================================

    if (
      question.includes(
        "evaluation"
      ) ||
      question.includes(
        "evaluation call"
      ) ||
      question.includes(
        "evaluation calls"
      )
    ) {
      return res.json({
        success: true,

        answer:
          `Evaluation calls completed: ${evaluationCalls}`,
      });
    }

    // ======================================================
    // FOLLOW UP COUNT
    // ======================================================

    if (
      question === "follow up" ||
      question === "followups" ||
      question === "follow ups" ||
      question.includes(
        "how many follow"
      ) ||
      question.includes(
        "follow up kitne"
      ) ||
      question.includes(
        "follow up kitni"
      )
    ) {
      return res.json({
        success: true,

        answer:
          `Total follow-up records: ${followUps}`,
      });
    }

    // ======================================================
    // TODAY'S REQUIREMENTS
    // ======================================================

    if (
      question.includes("today") ||
      question.includes("aaj")
    ) {
      const todayKey =
        getTodayKey();

      const todayRows =
        requirements.filter(
          (item) => {
            return (
              normalizeDateForComparison(
                item.clientProposalSharedDate
              ) === todayKey
            );
          }
        );

      if (!todayRows.length) {
        return res.json({
          success: true,

          answer:
            "Aaj ki koi requirement Excel me nahi mili.",
        });
      }

      const answer =
        todayRows
          .map(
            (item, index) =>
              `${index + 1}. ${
                item.requirementName ||
                "Requirement"
              }\n` +
              `   Client: ${
                item.clientName ||
                "N/A"
              }\n` +
              `   Status: ${
                item.requirementStatus ||
                "N/A"
              }\n` +
              `   OPS: ${
                item.assignedOpsPerson ||
                "N/A"
              }`
          )
          .join("\n\n");

      return res.json({
        success: true,

        answer:
          `Today's Requirements: ${todayRows.length}\n\n${answer}`,
      });
    }

    // ======================================================
    // CLIENT-SPECIFIC SEARCH
    // ======================================================

    const clientMatches =
      requirements.filter(
        (item) => {
          const clientName =
            normalizeText(
              item.clientName
            );

          return (
            clientName &&
            clientName.length >= 3 &&
            question.includes(
              clientName
            )
          );
        }
      );

    if (clientMatches.length) {
      const clientName =
        clientMatches[0]
          .clientName;

      const answer =
        clientMatches
          .map(
            (item, index) =>
              `${index + 1}. ${
                item.requirementName ||
                "Requirement"
              }\n` +
              `   Client: ${
                item.clientName ||
                "N/A"
              }\n` +
              `   Status: ${
                item.requirementStatus ||
                "N/A"
              }\n` +
              `   OPS: ${
                item.assignedOpsPerson ||
                "N/A"
              }\n` +
              `   Sales: ${
                item.salesPerson ||
                "N/A"
              }\n` +
              `   Trainer: ${
                item.trainerName ||
                "N/A"
              }`
          )
          .join("\n\n");

      return res.json({
        success: true,

        answer:
          `${clientName} ki ${clientMatches.length} requirement(s) mili:\n\n${answer}`,
      });
    }

    // ======================================================
    // OPS PERSON SEARCH
    // ======================================================

    const opsMatches =
      requirements.filter(
        (item) => {
          const opsName =
            normalizeText(
              item.assignedOpsPerson
            );

          return (
            opsName &&
            opsName.length >= 3 &&
            question.includes(
              opsName
            )
          );
        }
      );

    if (opsMatches.length) {
      const person =
        opsMatches[0]
          .assignedOpsPerson;

      const answer =
        opsMatches
          .map(
            (item, index) =>
              `${index + 1}. ${
                item.requirementName ||
                "Requirement"
              } — ${
                item.clientName ||
                "Client"
              } — ${
                item.requirementStatus ||
                "N/A"
              }`
          )
          .join("\n");

      return res.json({
        success: true,

        answer:
          `${person} ko ${opsMatches.length} requirement(s) assigned hain:\n\n${answer}`,
      });
    }

    // ======================================================
    // SALES PERSON SEARCH
    // ======================================================

    const salesMatches =
      requirements.filter(
        (item) => {
          const salesName =
            normalizeText(
              item.salesPerson
            );

          return (
            salesName &&
            salesName.length >= 3 &&
            question.includes(
              salesName
            )
          );
        }
      );

    if (salesMatches.length) {
      const person =
        salesMatches[0]
          .salesPerson;

      const answer =
        salesMatches
          .map(
            (item, index) =>
              `${index + 1}. ${
                item.requirementName ||
                "Requirement"
              } — ${
                item.clientName ||
                "Client"
              } — ${
                item.requirementStatus ||
                "N/A"
              }`
          )
          .join("\n");

      return res.json({
        success: true,

        answer:
          `${person} ke ${salesMatches.length} requirement(s) hain:\n\n${answer}`,
      });
    }

    // ======================================================
    // CLIENT LIST
    // ======================================================

    if (
      question.includes("client") &&
      (
        question.includes("list") ||
        question.includes("batao") ||
        question.includes("show") ||
        question.includes("kitne") ||
        question.includes("kitni")
      )
    ) {
      return res.json({
        success: true,

        answer:
          `Total unique clients: ${clients.length}\n\n` +
          clients
            .map(
              (client, index) =>
                `${index + 1}. ${client}`
            )
            .join("\n"),
      });
    }

    // ======================================================
    // OPS PERSON LIST
    // ======================================================

    if (
      question.includes("ops") &&
      (
        question.includes("list") ||
        question.includes("batao") ||
        question.includes("show")
      )
    ) {
      return res.json({
        success: true,

        answer:
          `OPS Persons: ${opsPersons.length}\n\n` +
          opsPersons
            .map(
              (person, index) =>
                `${index + 1}. ${person}`
            )
            .join("\n"),
      });
    }

    // ======================================================
    // SALES PERSON LIST
    // ======================================================

    if (
      question.includes("sales") &&
      (
        question.includes("list") ||
        question.includes("batao") ||
        question.includes("show")
      )
    ) {
      return res.json({
        success: true,

        answer:
          `Sales Persons: ${salesPersons.length}\n\n` +
          salesPersons
            .map(
              (person, index) =>
                `${index + 1}. ${person}`
            )
            .join("\n"),
      });
    }

    // ======================================================
    // ALL FOLLOW-UP DETAILS
    // ======================================================

    if (
      question.includes("follow up") ||
      question.includes("follow-up") ||
      question.includes("followup")
    ) {
      const followUpRows =
        requirements.filter(
          (item) =>
            String(
              item.followUp || ""
            ).trim() !== ""
        );

      if (!followUpRows.length) {
        return res.json({
          success: true,

          answer:
            "Excel me koi follow-up information available nahi hai.",
        });
      }

      const answer =
        followUpRows
          .slice(0, 20)
          .map(
            (item, index) =>
              `${index + 1}. ${
                item.requirementName ||
                "Requirement"
              }\n` +
              `   Client: ${
                item.clientName ||
                "N/A"
              }\n` +
              `   Follow Up: ${
                item.followUp
              }`
          )
          .join("\n\n");

      return res.json({
        success: true,

        answer:
          `Follow-up records: ${followUpRows.length}\n\n${answer}`,
      });
    }

    // ======================================================
    // REQUIREMENT / CLIENT / TRAINER SEARCH
    // ======================================================

    const words =
      question
        .split(/\s+/)
        .map((word) =>
          word.replace(
            /[^a-zA-Z0-9@._-]/g,
            ""
          )
        )
        .filter(
          (word) =>
            word.length >= 3
        );

    const requirementMatches =
      requirements.filter(
        (item) => {
          const searchable = [
            item.requirementName,
            item.clientName,
            item.assignedOpsPerson,
            item.salesPerson,
            item.trainerName,
            item.requirementStatus,
            item.evaluationCallStatus,
          ]
            .join(" ")
            .toLowerCase();

          return words.some(
            (word) =>
              searchable.includes(word)
          );
        }
      );

    if (requirementMatches.length) {
      const answer =
        requirementMatches
          .slice(0, 10)
          .map(
            (item, index) =>
              `${index + 1}. ${
                item.requirementName ||
                "Requirement"
              }\n` +
              `   Client: ${
                item.clientName ||
                "N/A"
              }\n` +
              `   Status: ${
                item.requirementStatus ||
                "N/A"
              }\n` +
              `   OPS: ${
                item.assignedOpsPerson ||
                "N/A"
              }\n` +
              `   Sales: ${
                item.salesPerson ||
                "N/A"
              }\n` +
              `   Trainer: ${
                item.trainerName ||
                "N/A"
              }`
          )
          .join("\n\n");

      return res.json({
        success: true,

        answer:
          `Excel data se ${requirementMatches.length} matching record(s) mili:\n\n${answer}`,
      });
    }

    // ======================================================
    // DEFAULT RESPONSE
    // ======================================================

    return res.json({
      success: true,

      answer:
        "Main live Excel requirement data se ye information de sakta hoon:\n\n" +
        "• Total requirements\n" +
        "• Served / Regret\n" +
        "• Follow-ups\n" +
        "• Evaluation calls\n" +
        "• Today's requirements\n" +
        "• Client requirements\n" +
        "• OPS assignments\n" +
        "• Sales assignments\n" +
        "• Trainers\n" +
        "• Requirement summary\n\n" +
        'Example: "Reliance ki requirements batao"',
    });
  } catch (error) {
    console.error(
      "Local Copilot Error:",
      error
    );

    return res.status(500).json({
      success: false,

      answer:
        "Copilot Excel data read nahi kar pa raha.",

      error:
        error.message,
    });
  }
});

// ==========================================================
// START SERVER
// ==========================================================

app.listen(PORT, () => {
  console.log("");

  console.log(
    "========================================"
  );

  console.log(
    "     OPS REQUIREMENT DASHBOARD API"
  );

  console.log(
    "========================================"
  );

  console.log(
    `Server: http://localhost:${PORT}`
  );

  console.log(
    `Excel: ${EXCEL_FILE}`
  );

  console.log(
    "Mode: Unlimited Excel Rows"
  );

  console.log(
    "Auto refresh supported"
  );

  console.log(
    "Excel Open: ENABLED"
  );

  console.log(
    "Excel Download: DISABLED"
  );

  console.log(
    "AI Copilot: LOCAL / FREE"
  );

  console.log(
    "OpenAI API: DISABLED"
  );

  console.log(
    "========================================"
  );

  console.log("");
});