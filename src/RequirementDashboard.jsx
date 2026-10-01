import React, { useEffect, useMemo, useState } from "react";
import "./RequirementDashboard.css";

const COLUMNS = [
  {
    key: "sNo",
    label: "S.No.",
    className: "col-sno",
  },
  {
    key: "clientProposalSharedDate",
    label: "Client Proposal Shared Date",
    className: "col-date",
  },
  {
    key: "clientProposalSharedTime",
    label: "Client Proposal Shared Time",
    className: "col-time",
  },
  {
    key: "requirementName",
    label: "Requirement Name",
    className: "col-requirement",
  },
  {
    key: "assignedOpsPerson",
    label: "Assigned OPS Person",
    className: "col-ops",
  },
  {
    key: "salesPerson",
    label: "Sales Person",
    className: "col-sales",
  },
  {
    key: "clientName",
    label: "Client Name",
    className: "col-client",
  },
  {
    key: "requirementStatus",
    label: "Requirement Status (Served / Regret)",
    className: "col-status",
  },
  {
    key: "trainerName",
    label: "Trainer Name",
    className: "col-trainer",
  },
  {
    key: "trainerContactDetails",
    label: "Trainer Contact Details (Mail ID & Phn. No.)",
    className: "col-contact",
  },
  {
    key: "evaluationCallStatus",
    label: "Evaluation Call Status (Yes/No)",
    className: "col-evaluation",
  },
  {
    key: "followUp1",
    label: "Follow Up 1",
    className: "col-followup",
  },
  {
    key: "followUp2",
    label: "Follow Up 2",
    className: "col-followup",
  },
  {
    key: "followUp3",
    label: "Follow Up 3",
    className: "col-followup",
  },
];

const FOLLOW_UP_CONFIG = [
  {
    number: 1,
    days: 2,
    label: "Follow Up 1",
  },
  {
    number: 2,
    days: 4,
    label: "Follow Up 2",
  },
  {
    number: 3,
    days: 6,
    label: "Follow Up 3",
  },
];

/* ==========================================================
   DATE HELPERS
========================================================== */

const parseExcelDate = (value) => {
  if (!value) return null;

  const text = String(value).trim();

  if (!text) return null;

  const monthNames = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  /*
    Handles:
    22-Sep-26
    22/09/2026
    22-09-2026
    2026-09-22
  */

  let match = text.match(
    /^(\d{1,2})[-/\s]([A-Za-z]+)[-/\s](\d{2,4})$/
  );

  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();

    let year = parseInt(match[3], 10);

    if (year < 100) {
      year += 2000;
    }

    const month = monthNames[monthName];

    if (
      !Number.isNaN(day) &&
      !Number.isNaN(year) &&
      month !== undefined
    ) {
      const date = new Date(
        year,
        month,
        day
      );

      if (!Number.isNaN(date.getTime())) {
        date.setHours(0, 0, 0, 0);
        return date;
      }
    }
  }

  /*
    DD-MM-YYYY
  */

  match = text.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
  );

  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (!Number.isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  /*
    YYYY-MM-DD
  */

  match = text.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
  );

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (!Number.isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  const fallback = new Date(text);

  if (!Number.isNaN(fallback.getTime())) {
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }

  return null;
};

const getFollowUpDateObject = (
  value,
  days
) => {
  const date = parseExcelDate(value);

  if (!date) return null;

  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  result.setDate(
    result.getDate() + days
  );

  return result;
};

const getFollowUpDate = (
  value,
  days
) => {
  const date = getFollowUpDateObject(
    value,
    days
  );

  if (!date) return "—";

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const getDateKey = (date) => {
  if (!date) return "";

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
};

const getTodayKey = () =>
  getDateKey(new Date());

const getTodayText = () =>
  new Date().toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

/* ==========================================================
   DASHBOARD
========================================================== */

export default function RequirementDashboard({
  rows = [],
}) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [
    evaluationFilter,
    setEvaluationFilter,
  ] = useState("All");

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  /* ========================================================
     AI COPILOT
  ======================================================== */

  const [
    copilotOpen,
    setCopilotOpen,
  ] = useState(false);

  const [
    copilotQuestion,
    setCopilotQuestion,
  ] = useState("");

  const [
    copilotAnswer,
    setCopilotAnswer,
  ] = useState("");

  const [
    copilotLoading,
    setCopilotLoading,
  ] = useState(false);

  const [
    copilotError,
    setCopilotError,
  ] = useState("");

  /* ========================================================
     DATE REFRESH
  ======================================================== */

  const [, setCurrentDate] =
    useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60 * 1000);

    return () =>
      clearInterval(timer);
  }, []);

  /* ========================================================
     FOLLOW-UP STATUS
  ======================================================== */

  const [
    followUpStatuses,
    setFollowUpStatuses,
  ] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "opsFollowUpStatuses"
        ) || "{}"
      );
    } catch {
      return {};
    }
  });

  /* ========================================================
     CLEAR ONLY OLD ACCIDENTAL STATUS
     ACCEPT / DECLINE BUTTONS REMAIN
  ======================================================== */

  useEffect(() => {
    const cleanupKey =
      "opsFollowUpStatusesCleanupV1";

    try {
      if (
        localStorage.getItem(
          cleanupKey
        ) !== "done"
      ) {
        localStorage.removeItem(
          "opsFollowUpStatuses"
        );

        localStorage.setItem(
          cleanupKey,
          "done"
        );

        setFollowUpStatuses({});
      }
    } catch {
      setFollowUpStatuses({});
    }
  }, []);

  const allRows = Array.isArray(rows)
    ? rows
    : [];

  const getFollowUpStatusKey = (
    row,
    number
  ) =>
    `${row.sNo}-followup-${number}`;

  const getFollowUpStatus = (
    row,
    number
  ) =>
    followUpStatuses[
      getFollowUpStatusKey(
        row,
        number
      )
    ] || null;

  const updateFollowUpStatus = (
    row,
    number,
    status
  ) => {
    const key =
      getFollowUpStatusKey(
        row,
        number
      );

    setFollowUpStatuses(
      (previous) => {
        const updated = {
          ...previous,
          [key]: status,
        };

        try {
          localStorage.setItem(
            "opsFollowUpStatuses",
            JSON.stringify(updated)
          );
        } catch {
          // Ignore storage errors
        }

        return updated;
      }
    );
  };

  /* ========================================================
     AI COPILOT
  ======================================================== */

  const askCopilot = async (
    question = copilotQuestion
  ) => {
    const text = String(
      question || ""
    ).trim();

    if (
      !text ||
      copilotLoading
    ) {
      return;
    }

    setCopilotLoading(true);
    setCopilotError("");
    setCopilotAnswer("");

    try {
      const response =
        await fetch(
          "http://localhost:5000/api/copilot",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              question: text,
            }),
          }
        );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `AI Copilot request failed (${response.status})`
        );
      }

      const answer =
        data?.answer ||
        data?.response ||
        data?.message ||
        data?.result ||
        "";

      if (!answer) {
        throw new Error(
          "AI Copilot returned an empty response."
        );
      }

      setCopilotAnswer(
        String(answer)
      );

      setCopilotQuestion("");
    } catch (error) {
      console.error(
        "AI Copilot Error:",
        error
      );

      setCopilotError(
        error?.message ||
          "Unable to connect with AI Copilot."
      );
    } finally {
      setCopilotLoading(false);
    }
  };

  const quickQuestions = [
    "Total requirements kitni hain?",
    "Kitne requirements Served aur Regret hain?",
    "Aaj ke follow-ups kaunse hain?",
    "Evaluation calls kitni hain?",
    "Mujhe aaj ke important tasks ka summary do.",
    "Client ki requirements batao.",
  ];

  /* ========================================================
     SEARCH
  ======================================================== */

  const filteredRows = useMemo(() => {
    const searchValue =
      search
        .trim()
        .toLowerCase();

    return allRows.filter(
      (row) => {
        const status =
          String(
            row.requirementStatus ||
              ""
          ).toLowerCase();

        const evaluation =
          String(
            row.evaluationCallStatus ||
              ""
          ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          COLUMNS.some(
            (column) => {
              if (
                column.key ===
                "followUp1"
              ) {
                return getFollowUpDate(
                  row.clientProposalSharedDate,
                  2
                )
                  .toLowerCase()
                  .includes(
                    searchValue
                  );
              }

              if (
                column.key ===
                "followUp2"
              ) {
                return getFollowUpDate(
                  row.clientProposalSharedDate,
                  4
                )
                  .toLowerCase()
                  .includes(
                    searchValue
                  );
              }

              if (
                column.key ===
                "followUp3"
              ) {
                return getFollowUpDate(
                  row.clientProposalSharedDate,
                  6
                )
                  .toLowerCase()
                  .includes(
                    searchValue
                  );
              }

              return String(
                row[
                  column.key
                ] ?? ""
              )
                .toLowerCase()
                .includes(
                  searchValue
                );
            }
          );

        const matchesStatus =
          statusFilter ===
            "All" ||
          status ===
            statusFilter.toLowerCase();

        const matchesEvaluation =
          evaluationFilter ===
            "All" ||
          evaluation ===
            evaluationFilter.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus &&
          matchesEvaluation
        );
      }
    );
  }, [
    allRows,
    search,
    statusFilter,
    evaluationFilter,
  ]);

  /* ========================================================
     STATS
  ======================================================== */

  const stats = useMemo(() => {
    const served =
      allRows.filter(
        (row) =>
          String(
            row.requirementStatus ||
              ""
          ).toLowerCase() ===
          "served"
      ).length;

    const regret =
      allRows.filter(
        (row) =>
          String(
            row.requirementStatus ||
              ""
          ).toLowerCase() ===
          "regret"
      ).length;

    const evaluationYes =
      allRows.filter(
        (row) =>
          String(
            row.evaluationCallStatus ||
              ""
          ).toLowerCase() ===
          "yes"
      ).length;

    const followUps =
      allRows.filter(
        (row) =>
          String(
            row.followUp ||
              ""
          ).trim() !== ""
      ).length;

    const clients =
      new Set(
        allRows
          .map((row) =>
            String(
              row.clientName ||
                ""
            ).trim()
          )
          .filter(Boolean)
      ).size;

    return {
      total: allRows.length,
      served,
      regret,
      evaluationYes,
      followUps,
      clients,
    };
  }, [allRows]);

  /* ========================================================
     FOLLOW-UP NOTIFICATIONS
  ======================================================== */

  const allFollowUpNotifications =
    useMemo(() => {
      const list = [];

      allRows.forEach(
        (row, rowIndex) => {
          FOLLOW_UP_CONFIG.forEach(
            (config) => {
              const date =
                getFollowUpDateObject(
                  row.clientProposalSharedDate,
                  config.days
                );

              if (!date) return;

              list.push({
                id: `${row.sNo || rowIndex}-${config.number}`,
                row,
                followUpNumber:
                  config.number,
                followUpLabel:
                  config.label,
                date,
                dateText:
                  getFollowUpDate(
                    row.clientProposalSharedDate,
                    config.days
                  ),
                status:
                  getFollowUpStatus(
                    row,
                    config.number
                  ),
              });
            }
          );
        }
      );

      return list.sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime()
      );
    }, [
      allRows,
      followUpStatuses,
    ]);

  /* ONLY TODAY + ONLY PENDING */

  const notifications =
    useMemo(() => {
      const todayKey =
        getTodayKey();

      return allFollowUpNotifications.filter(
        (item) => {
          if (
            getDateKey(
              item.date
            ) !== todayKey
          ) {
            return false;
          }

          if (
            item.status ===
              "Completed" ||
            item.status ===
              "Not Completed"
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      allFollowUpNotifications,
    ]);

  /* ========================================================
     BADGES
  ======================================================== */

  const getStatusClass = (
    status
  ) => {
    const value =
      String(
        status || ""
      ).toLowerCase();

    if (
      value ===
      "served"
    ) {
      return "status-served";
    }

    if (
      value ===
      "regret"
    ) {
      return "status-regret";
    }

    return "status-default";
  };

  const getEvaluationClass = (
    value
  ) => {
    const result =
      String(
        value || ""
      ).toLowerCase();

    if (
      result ===
      "yes"
    ) {
      return "evaluation-yes";
    }

    if (
      result ===
      "no"
    ) {
      return "evaluation-no";
    }

    return "evaluation-default";
  };

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div className="requirement-dashboard">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="dashboard-header">

        <div className="brand-section">

          <div className="brand-icon">
            ▣
          </div>

          <div>

            <h1>
              OPS Requirement Tracker
            </h1>

            <p>
              Tracking • Follow Ups • Requirement
            </p>

          </div>

        </div>

        <div className="header-right">

          {/* SEARCH */}

          <div className="search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search S.No, Client Name, Requirement..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {/* ==================================================
              NOTIFICATION
          ================================================== */}

          <div className="notification-wrapper">

            <button
              type="button"
              className="notification-button"
              title="Today's Follow Up Notifications"
              onClick={() =>
                setNotificationOpen(
                  (previous) =>
                    !previous
                )
              }
            >

              🔔

              {notifications.length >
                0 && (
                <span className="notification-count">
                  {notifications.length >
                  99
                    ? "99+"
                    : notifications.length}
                </span>
              )}

            </button>

            {notificationOpen && (
              <div className="notification-panel">

                <div className="notification-header">

                  <div>

                    <h3>
                      Today's Follow Ups
                    </h3>

                    <span>
                      {getTodayText()}
                    </span>

                  </div>

                  <button
                    type="button"
                    className="notification-close"
                    onClick={() =>
                      setNotificationOpen(
                        false
                      )
                    }
                  >
                    ×
                  </button>

                </div>

                <div className="notification-list">

                  {notifications.length ===
                  0 ? (

                    <div className="notification-empty">

                      <div className="notification-empty-icon">
                        ✓
                      </div>

                      <strong>
                        No follow-ups for today
                      </strong>

                      <span>
                        Today's follow-up
                        notifications will
                        appear here automatically.
                      </span>

                    </div>

                  ) : (

                    notifications.map(
                      (notification) => {

                        const row =
                          notification.row;

                        return (
                          <div
                            key={
                              notification.id
                            }
                            className="notification-item"
                          >

                            <div className="notification-item-top">

                              <div className="notification-icon">
                                🔔
                              </div>

                              <div className="notification-main">

                                <strong>
                                  {
                                    notification.followUpLabel
                                  }
                                </strong>

                                {row.assignedOpsPerson &&
                                  String(
                                    row.assignedOpsPerson
                                  ).trim() && (
                                    <span className="notification-person">
                                      Assigned OPS:{" "}
                                      {
                                        row.assignedOpsPerson
                                      }
                                    </span>
                                  )}

                                {row.salesPerson &&
                                  String(
                                    row.salesPerson
                                  ).trim() &&
                                  ![
                                    "-",
                                    "—",
                                    "N/A",
                                    "NA",
                                    "Not assigned",
                                    "Unassigned",
                                  ].includes(
                                    String(
                                      row.salesPerson
                                    ).trim()
                                  ) && (
                                    <span className="notification-sales">
                                      Sales Person:{" "}
                                      {
                                        row.salesPerson
                                      }
                                    </span>
                                  )}

                                <span className="notification-client">

                                  {row.clientName &&
                                  ![
                                    "-",
                                    "—",
                                    "N/A",
                                    "NA",
                                    "NULL",
                                    "UNDEFINED",
                                  ].includes(
                                    String(
                                      row.clientName
                                    )
                                      .trim()
                                      .toUpperCase()
                                  )
                                    ? `Client: ${row.clientName}`
                                    : "Client: Not provided"}

                                </span>

                                <span className="notification-proposal-date">

                                  Client Proposal Shared:{" "}

                                  {(() => {
                                    const date =
                                      parseExcelDate(
                                        row.clientProposalSharedDate
                                      );

                                    if (!date) {
                                      return (
                                        row.clientProposalSharedDate ||
                                        "Not provided"
                                      );
                                    }

                                    return date.toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    );
                                  })()}

                                </span>

                                <small>
                                  {
                                    row.requirementName ||
                                    "Requirement"
                                  }
                                </small>

                              </div>

                            </div>

                            <div className="notification-date today">

                              🔔 Follow-up Due:{" "}

                              {
                                notification.dateText
                              }

                            </div>

                            {/* ACCEPT / DECLINE */}

                            <div className="notification-actions">

                              <button
                                type="button"
                                className="accept-button"
                                onClick={() =>
                                  updateFollowUpStatus(
                                    row,
                                    notification.followUpNumber,
                                    "Completed"
                                  )
                                }
                              >
                                ✓ Accept
                              </button>

                              <button
                                type="button"
                                className="decline-button"
                                onClick={() =>
                                  updateFollowUpStatus(
                                    row,
                                    notification.followUpNumber,
                                    "Not Completed"
                                  )
                                }
                              >
                                × Decline
                              </button>

                            </div>

                          </div>
                        );
                      }
                    )

                  )}

                </div>

              </div>
            )}

          </div>

          {/* ==================================================
              AI COPILOT
          ================================================== */}

          <div className="copilot-wrapper">

            <button
              type="button"
              className="copilot-button"
              onClick={() =>
                setCopilotOpen(
                  (previous) =>
                    !previous
                )
              }
            >
              ✨ AI Copilot
            </button>

            {copilotOpen && (

              <div className="copilot-panel">

                <div className="copilot-header">

                  <div className="copilot-title">

                    <div className="copilot-icon">
                      ✨
                    </div>

                    <div>

                      <h3>
                        AI Copilot
                      </h3>

                      <span>
                        Ask about your live requirements
                      </span>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="copilot-close"
                    onClick={() =>
                      setCopilotOpen(
                        false
                      )
                    }
                  >
                    ×
                  </button>

                </div>

                {/* QUICK QUESTIONS */}

                <div className="copilot-questions">

                  {quickQuestions.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          askCopilot(
                            question
                          )
                        }
                      >
                        {question}
                      </button>
                    )
                  )}

                </div>

                {/* LOADING */}

                {copilotLoading && (

                  <div className="copilot-loading">

                    <div className="copilot-loader">
                      ✨
                    </div>

                    <span>
                      AI is analyzing your
                      latest Excel requirement data...
                    </span>

                  </div>

                )}

                {/* ERROR */}

                {copilotError && (

                  <div className="copilot-error">

                    <strong>
                      Copilot Error
                    </strong>

                    <span>
                      {copilotError}
                    </span>

                  </div>

                )}

                {/* ANSWER */}

                {copilotAnswer &&
                  !copilotLoading && (

                    <div className="copilot-answer">

                      <div className="copilot-answer-title">
                        ✨ AI Response
                      </div>

                      <div className="copilot-answer-text">
                        {copilotAnswer}
                      </div>

                    </div>

                  )}

                {/* INPUT */}

                <div className="copilot-input-area">

                  <input
                    type="text"
                    placeholder="Ask something about requirements..."
                    value={
                      copilotQuestion
                    }
                    onChange={(e) =>
                      setCopilotQuestion(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {

                      if (
                        e.key ===
                          "Enter" &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();

                        askCopilot();
                      }

                    }}
                  />

                  <button
                    type="button"
                    className="copilot-send"
                    disabled={
                      copilotLoading ||
                      !copilotQuestion.trim()
                    }
                    onClick={() =>
                      askCopilot()
                    }
                  >
                    {copilotLoading
                      ? "..."
                      : "Ask"}
                  </button>

                </div>

                <div className="copilot-footer">

                  AI answers are based on the latest
                  Excel requirement data.

                </div>

              </div>

            )}

          </div>

          {/* ==================================================
              PROFILE
          ================================================== */}

          <div className="profile">

            <div className="profile-circle">
              SSDN
            </div>

            <span>
              Admin
            </span>

          </div>

        </div>

      </header>

      {/* ====================================================
          MAIN
      ==================================================== */}

      <main className="dashboard-content">

        {/* ==================================================
            KPI
        ================================================== */}

        <section className="stats-grid">

          <div className="stat-card blue">

            <div className="stat-icon">
              ▤
            </div>

            <div>

              <span>
                Total Requirements
              </span>

              <strong>
                {stats.total}
              </strong>

            </div>

          </div>

          <div className="stat-card green">

            <div className="stat-icon">
              ✓
            </div>

            <div>

              <span>
                Served
              </span>

              <strong>
                {stats.served}
              </strong>

            </div>

          </div>

          <div className="stat-card red">

            <div className="stat-icon">
              !
            </div>

            <div>

              <span>
                Regret
              </span>

              <strong>
                {stats.regret}
              </strong>

            </div>

          </div>

          <div className="stat-card orange">

            <div className="stat-icon">
              ↗
            </div>

            <div>

              <span>
                Follow Up
              </span>

              <strong>
                {stats.followUps}
              </strong>

            </div>

          </div>

          <div className="stat-card purple">

            <div className="stat-icon">
              ☎
            </div>

            <div>

              <span>
                Evaluation Calls
              </span>

              <strong>
                {stats.evaluationYes}
              </strong>

            </div>

          </div>

          <div className="stat-card cyan">

            <div className="stat-icon">
              ♙
            </div>

            <div>

              <span>
                Total Clients
              </span>

              <strong>
                {stats.clients}
              </strong>

            </div>

          </div>

        </section>

        {/* ==================================================
            TABLE
        ================================================== */}

        <section className="table-card">

          <div className="table-toolbar">

            <div>

              <h2>
                Requirement Tracker
              </h2>

              <p>
                Live data from Ops OND Requirement Tracker
              </p>

            </div>

            <div className="filters">

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Status
                </option>

                <option value="Served">
                  Served
                </option>

                <option value="Regret">
                  Regret
                </option>

              </select>

              <select
                value={
                  evaluationFilter
                }
                onChange={(e) =>
                  setEvaluationFilter(
                    e.target.value
                  )
                }
              >

                <option value="All">
                  All Evaluation
                </option>

                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>

              </select>

            </div>

          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  {COLUMNS.map(
                    (column) => (

                      <th
                        key={
                          column.key
                        }
                        className={
                          column.className
                        }
                      >
                        {
                          column.label
                        }
                      </th>

                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {filteredRows.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan={
                        COLUMNS.length
                      }
                      className="empty-state"
                    >
                      No requirement data
                      available.
                    </td>

                  </tr>

                ) : (

                  filteredRows.map(
                    (row, index) => (

                      <tr
                        key={`${row.sNo}-${index}`}
                      >

                        {COLUMNS.map(
                          (column) => {

                            /* ==============================
                               FOLLOW UP 1
                            ============================== */

                            if (
                              column.key ===
                              "followUp1"
                            ) {

                              const status =
                                getFollowUpStatus(
                                  row,
                                  1
                                );

                              return (

                                <td
                                  key={
                                    column.key
                                  }
                                  className="followup-cell"
                                >

                                  <div className="followup-date">

                                    {getFollowUpDate(
                                      row.clientProposalSharedDate,
                                      2
                                    )}

                                  </div>

                                  {status && (

                                    <div
                                      className={`followup-completion-status ${
                                        status ===
                                        "Completed"
                                          ? "completed"
                                          : "not-completed"
                                      }`}
                                    >

                                      {status ===
                                      "Completed"
                                        ? "✓ Completed"
                                        : "× Not Completed"}

                                    </div>

                                  )}

                                </td>

                              );

                            }

                            /* ==============================
                               FOLLOW UP 2
                            ============================== */

                            if (
                              column.key ===
                              "followUp2"
                            ) {

                              const status =
                                getFollowUpStatus(
                                  row,
                                  2
                                );

                              return (

                                <td
                                  key={
                                    column.key
                                  }
                                  className="followup-cell"
                                >

                                  <div className="followup-date">

                                    {getFollowUpDate(
                                      row.clientProposalSharedDate,
                                      4
                                    )}

                                  </div>

                                  {status && (

                                    <div
                                      className={`followup-completion-status ${
                                        status ===
                                        "Completed"
                                          ? "completed"
                                          : "not-completed"
                                      }`}
                                    >

                                      {status ===
                                      "Completed"
                                        ? "✓ Completed"
                                        : "× Not Completed"}

                                    </div>

                                  )}

                                </td>

                              );

                            }

                            /* ==============================
                               FOLLOW UP 3
                            ============================== */

                            if (
                              column.key ===
                              "followUp3"
                            ) {

                              const status =
                                getFollowUpStatus(
                                  row,
                                  3
                                );

                              return (

                                <td
                                  key={
                                    column.key
                                  }
                                  className="followup-cell"
                                >

                                  <div className="followup-date">

                                    {getFollowUpDate(
                                      row.clientProposalSharedDate,
                                      6
                                    )}

                                  </div>

                                  {status && (

                                    <div
                                      className={`followup-completion-status ${
                                        status ===
                                        "Completed"
                                          ? "completed"
                                          : "not-completed"
                                      }`}
                                    >

                                      {status ===
                                      "Completed"
                                        ? "✓ Completed"
                                        : "× Not Completed"}

                                    </div>

                                  )}

                                </td>

                              );

                            }

                            const value =
                              row[
                                column.key
                              ];

                            /* ==============================
                               STATUS
                            ============================== */

                            if (
                              column.key ===
                              "requirementStatus"
                            ) {

                              return (

                                <td
                                  key={
                                    column.key
                                  }
                                >

                                  <span
                                    className={`status-badge ${getStatusClass(
                                      value
                                    )}`}
                                  >

                                    {value ||
                                      "—"}

                                  </span>

                                </td>

                              );

                            }

                            /* ==============================
                               EVALUATION
                            ============================== */

                            if (
                              column.key ===
                              "evaluationCallStatus"
                            ) {

                              return (

                                <td
                                  key={
                                    column.key
                                  }
                                >

                                  <span
                                    className={`evaluation-badge ${getEvaluationClass(
                                      value
                                    )}`}
                                  >

                                    {value ||
                                      "—"}

                                  </span>

                                </td>

                              );

                            }

                            /* ==============================
                               NORMAL CELL
                            ============================== */

                            return (

                              <td
                                key={
                                  column.key
                                }
                              >

                                {value ||
                                  "—"}

                              </td>

                            );

                          }
                        )}

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="table-footer">

            <span>

              Showing{" "}

              <strong>
                {
                  filteredRows.length
                }
              </strong>

              {" "}of{" "}

              <strong>
                {
                  allRows.length
                }
              </strong>

              {" "}requirements

            </span>

            <span>

              {allRows.length > 0
                ? "All Excel rows loaded"
                : "No Excel data"}

            </span>

          </div>

        </section>

      </main>

    </div>
  );
}