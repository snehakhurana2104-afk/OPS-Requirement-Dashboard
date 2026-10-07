import React, { useEffect, useMemo, useState } from "react";
import "./RequirementDashboard.css";

/* =========================================================
   TABLE COLUMNS
========================================================= */

const COLUMNS = [
  { key: "sNo", label: "S.No.", className: "col-sno" },
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
  { key: "followUp1", label: "Follow Up 1", className: "col-followup" },
  { key: "followUp2", label: "Follow Up 2", className: "col-followup" },
  { key: "followUp3", label: "Follow Up 3", className: "col-followup" },
  { key: "followUp4", label: "Follow Up 4", className: "col-followup" },
  { key: "followUp5", label: "Follow Up 5", className: "col-followup" },
];

/* =========================================================
   DROPDOWN OPTIONS
========================================================= */

const OPS_PERSONS = ["Kamal", "Tisha", "Sneha", "Abhishek"];
const SALES_PERSONS = ["Prabodh", "Amit", "Srishti", "Rakhi"];
const REQUIREMENT_STATUSES = ["Served", "Regret"];
const EVALUATION_STATUSES = ["Yes", "No"];

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

const parseExcelDate = (value) => {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  if (!text) return null;

  if (typeof value === "number" || /^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(value);

    if (Number.isFinite(serial) && serial > 20000 && serial < 100000) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(
        excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
      );
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

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

  let match = text.match(
    /^(\d{1,2})[-/\s]([A-Za-z]+)[-/\s](\d{2,4})$/
  );

  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    let year = parseInt(match[3], 10);

    if (year < 100) year += 2000;

    const month = monthNames[monthName];

    if (
      !Number.isNaN(day) &&
      !Number.isNaN(year) &&
      month !== undefined
    ) {
      const date = new Date(year, month, day);

      if (!Number.isNaN(date.getTime())) {
        date.setHours(0, 0, 0, 0);
        return date;
      }
    }
  }

  match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const date = new Date(year, month - 1, day);

    if (!Number.isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const date = new Date(year, month - 1, day);

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

const formatDateDDMMYYYY = (value) => {
  const date = parseExcelDate(value);

  if (!date) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const formatTime12Hour = (value) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "—";
  }

  const text = String(value).trim();

  let match = text.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i
  );

  if (match) {
    const hour = parseInt(match[1], 10);
    const minute = match[2];
    const period = match[3].toUpperCase();

    if (hour >= 1 && hour <= 12) {
      return `${hour}:${minute} ${period}`;
    }
  }

  match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];

    if (hour >= 0 && hour <= 23) {
      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour}:${minute} ${period}`;
    }
  }

  const numericValue = Number(value);

  if (
    Number.isFinite(numericValue) &&
    numericValue >= 0 &&
    numericValue < 1
  ) {
    const totalMinutes = Math.round(numericValue * 24 * 60);
    let hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    let hour = value.getHours();
    const minute = value.getMinutes();
    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
  }

  return text;
};

/* =========================================================
   FOLLOW-UP CONFIGURATION
========================================================= */

/*
  Default schedule:
    Follow-Up 1 = original requirement date + 2 days
    Follow-Up 2 = Follow-Up 1 + 2 days
    Follow-Up 3 = Follow-Up 2 + 5 days
    Follow-Up 4 = Follow-Up 3 + 5 days
    Follow-Up 5 = Follow-Up 4 + 5 days

  Special Requirement Name schedule:
    If Requirement Name contains HCL, EXL, BNP, LTM or UCB:
    Follow-Up 1 = original requirement date + 3 days
    Follow-Up 2 = Follow-Up 1 + 4 days
    Follow-Up 3 = Follow-Up 2 + 4 days
    Follow-Up 4 = Follow-Up 3 + 4 days
    Follow-Up 5 = Follow-Up 4 + 4 days

  IMPORTANT:
    Every follow-up is calculated from the PREVIOUS follow-up's
    actual date. If that calculated date is Saturday/Sunday,
    it is moved to the next working day before the next
    follow-up is calculated.
*/

const FOLLOW_UP_CONFIG = [
  {
    number: 1,
    label: "Follow Up 1",
    defaultGapDays: 2,
    specialGapDays: 3,
  },
  {
    number: 2,
    label: "Follow Up 2",
    defaultGapDays: 2,
    specialGapDays: 4,
  },
  {
    number: 3,
    label: "Follow Up 3",
    defaultGapDays: 5,
    specialGapDays: 4,
  },
  {
    number: 4,
    label: "Follow Up 4",
    defaultGapDays: 5,
    specialGapDays: 4,
  },
  {
    number: 5,
    label: "Follow Up 5",
    defaultGapDays: 5,
    specialGapDays: 4,
  },
];

const SPECIAL_REQUIREMENT_KEYWORDS = [
  "HCL",
  "EXL",
  "BNP",
  "LTM",
  "UCB",
];

/*
  Matches the keyword as a word, so for example:
    "HCL Training"      -> special
    "BNP Project"       -> special
    "LTM-UCB Program"   -> special
  Matching is case-insensitive.
*/
const isSpecialRequirement = (requirementName) => {
  const text = String(requirementName || "").trim();

  if (!text) return false;

  return SPECIAL_REQUIREMENT_KEYWORDS.some((keyword) =>
    new RegExp(`\\b${keyword}\\b`, "i").test(text)
  );
};

const isWeekend = (date) => {
  if (!date) return false;

  const day = date.getDay();
  return day === 0 || day === 6;
};

const moveToNextWorkingDay = (date) => {
  if (!date) return null;

  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
};

/*
  Build the complete schedule sequentially.

  Example for a SPECIAL requirement:
    Base date = 1st
    F1 = 1st + 3 days
    F2 = F1 + 4 days
    F3 = F2 + 4 days
    F4 = F3 + 4 days
    F5 = F4 + 4 days

  If any result lands on Saturday/Sunday, that result is first
  moved to Monday (or the next working day), and THAT shifted
  date becomes the starting point for the next follow-up.
*/
const getWorkingDayFollowUpSchedule = (
  value,
  requirementName = ""
) => {
  const baseDate = parseExcelDate(value);

  if (!baseDate) return {};

  const special = isSpecialRequirement(requirementName);

  let previousFollowUpDate = new Date(baseDate);
  previousFollowUpDate.setHours(0, 0, 0, 0);

  const schedule = {};

  FOLLOW_UP_CONFIG.forEach((config) => {
    const gapDays = special
      ? config.specialGapDays
      : config.defaultGapDays;

    const calculatedDate = new Date(
      previousFollowUpDate
    );

    calculatedDate.setDate(
      calculatedDate.getDate() + gapDays
    );

    const actualWorkingDate =
      moveToNextWorkingDay(calculatedDate);

    schedule[config.number] = actualWorkingDate;

    // IMPORTANT: next follow-up starts from the
    // actual shifted working date.
    previousFollowUpDate = actualWorkingDate;
  });

  return schedule;
};

const getFollowUpDateObject = (
  value,
  followUpNumber,
  requirementName = ""
) => {
  const schedule = getWorkingDayFollowUpSchedule(
    value,
    requirementName
  );

  return schedule[followUpNumber] || null;
};

const getFollowUpDate = (
  value,
  followUpNumber,
  requirementName = ""
) => {
  const date = getFollowUpDateObject(
    value,
    followUpNumber,
    requirementName
  );

  if (!date) return "—";

  return formatDateDDMMYYYY(date);
};

const getDateKey = (date) => {
  if (!date) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const getTodayKey = () => getDateKey(new Date());
const getTodayText = () => formatDateDDMMYYYY(new Date());

const formatDateForInput = (value) => {
  const date = parseExcelDate(value);
  if (!date) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatTimeForInput = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "";
  }

  /* Excel can store time as a fraction of a day, e.g. 0.5 = 12:00. */
  if (typeof value === "number" && value >= 0 && value < 1) {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const text = String(value).trim();

  /* 12-hour format: 9:05 AM / 09:05 PM */
  let match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);

  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      if (period === "AM" && hour === 12) hour = 0;
      if (period === "PM" && hour !== 12) hour += 12;

      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }

  /* 24-hour format: 09:05 / 21:30 */
  match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (match) {
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }

  /* Excel may sometimes return a numeric string for the time fraction. */
  if (/^0(?:\.\d+)?$/.test(text) || /^0?\.\d+$/.test(text)) {
    const fraction = Number(text);

    if (Number.isFinite(fraction) && fraction >= 0 && fraction < 1) {
      const totalMinutes = Math.round(fraction * 24 * 60);
      const hours = Math.floor(totalMinutes / 60) % 24;
      const minutes = totalMinutes % 60;

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }

  /* Last fallback for values such as ISO datetime strings. */
  const parsed = new Date(text);

  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
  }

  return "";
};

/* =========================================================
   NORMALIZE EXCEL ROW
========================================================= */

const normalizeRow = (row) => {
  if (!row) return row;

  return {
    ...row,
    clientProposalSharedDate: formatDateDDMMYYYY(
      row.clientProposalSharedDate
    ),
    clientProposalSharedTime: formatTime12Hour(
      row.clientProposalSharedTime
    ),
  };
};

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_REQUIREMENT_FORM = {
  sNo: "",
  clientProposalSharedDate: "",
  clientProposalSharedTime: "",
  requirementName: "",
  assignedOpsPerson: "",
  salesPerson: "",
  clientName: "",
  requirementStatus: "",
  trainerName: "",
  trainerContactDetails: "",
  evaluationCallStatus: "",
  followUp: "",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function RequirementDashboard({
  rows = [],
  apiBaseUrl = "http://localhost:5000/api",
}) {
  /* =======================================================
     SEARCH / FILTER
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     LOCAL REQUIREMENTS
  ======================================================= */

  const [localRows, setLocalRows] = useState(
    Array.isArray(rows) ? rows.map(normalizeRow) : []
  );

  useEffect(() => {
    setLocalRows(Array.isArray(rows) ? rows.map(normalizeRow) : []);
  }, [rows]);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [notificationOpen, setNotificationOpen] = useState(false);

  /* =======================================================
     AI COPILOT
  ======================================================= */

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuestion, setCopilotQuestion] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotError, setCopilotError] = useState("");

  /* =======================================================
     CREATE / EDIT REQUIREMENT
  ======================================================= */

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState("");
  const [taskError, setTaskError] = useState("");

  const [requirementForm, setRequirementForm] = useState(
    EMPTY_REQUIREMENT_FORM
  );

  /* =======================================================
     DELETE
  ======================================================= */

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* =======================================================
     DATE REFRESH
  ======================================================= */

  const [, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  /* =======================================================
     FOLLOW UP STATUS
  ======================================================= */

  const [followUpStatuses, setFollowUpStatuses] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("opsFollowUpDecisionsV2") || "{}"
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const cleanupKey = "opsFollowUpDecisionsCleanupV2";

    try {
      if (localStorage.getItem(cleanupKey) !== "done") {
        localStorage.removeItem("opsFollowUpStatuses");
        localStorage.removeItem("opsFollowUpDecisionsV2");
        localStorage.setItem(cleanupKey, "done");
        setFollowUpStatuses({});
      }
    } catch {
      setFollowUpStatuses({});
    }
  }, []);

  // Keep follow-up notifications/statuses in sync if the status changes
  // from another browser tab/window using the same dashboard.
  useEffect(() => {
    const handleFollowUpStatusStorage = (event) => {
      if (event.key !== "opsFollowUpDecisionsV2") return;

      try {
        setFollowUpStatuses(
          event.newValue ? JSON.parse(event.newValue) : {}
        );
      } catch {
        setFollowUpStatuses({});
      }
    };

    window.addEventListener(
      "storage",
      handleFollowUpStatusStorage
    );

    return () =>
      window.removeEventListener(
        "storage",
        handleFollowUpStatusStorage
      );
  }, []);

  const getFollowUpStatusKey = (row, number) =>
    `${row.sNo}-followup-${number}`;

  const getFollowUpStatus = (row, number) =>
    followUpStatuses[getFollowUpStatusKey(row, number)] || null;

  const updateFollowUpStatus = (row, number, status) => {
    const key = getFollowUpStatusKey(row, number);

    setFollowUpStatuses((previous) => {
      const updated = {
        ...previous,
        [key]: status,
      };

      try {
        localStorage.setItem(
          "opsFollowUpDecisionsV2",
          JSON.stringify(updated)
        );
      } catch {}

      return updated;
    });
  };

  /* =======================================================
     FORM HELPERS
  ======================================================= */

  const resetForm = () => {
    setRequirementForm({ ...EMPTY_REQUIREMENT_FORM });
  };

  const openCreateTask = () => {
    setEditingRequirement(null);

    setRequirementForm({
      ...EMPTY_REQUIREMENT_FORM,
      sNo: String(localRows.length + 1),
    });

    setTaskSuccess("");
    setTaskError("");
    setCreateTaskOpen(true);
  };

  const openEditRequirement = (row) => {
    setEditingRequirement(row);

    setRequirementForm({
      sNo: row.sNo ?? "",
      clientProposalSharedDate: formatDateForInput(
        row.clientProposalSharedDate
      ),
      clientProposalSharedTime: formatTimeForInput(
        row.clientProposalSharedTime
      ),
      requirementName: row.requirementName ?? "",
      assignedOpsPerson: row.assignedOpsPerson ?? "",
      salesPerson: row.salesPerson ?? "",
      clientName: row.clientName ?? "",
      requirementStatus: row.requirementStatus ?? "",
      trainerName: row.trainerName ?? "",
      trainerContactDetails: row.trainerContactDetails ?? "",
      evaluationCallStatus: row.evaluationCallStatus ?? "",
      followUp: row.followUp ?? "",
    });

    setTaskSuccess("");
    setTaskError("");
    setCreateTaskOpen(true);
  };

  const closeCreateTask = () => {
    if (taskSaving) return;

    setCreateTaskOpen(false);
    setEditingRequirement(null);
    setTaskError("");
    setTaskSuccess("");
    resetForm();
  };

  const updateRequirementForm = (field, value) => {
    setRequirementForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateRequirementForm = () => {
    const form = requirementForm;

    if (!form.clientProposalSharedDate) {
      return "Client Proposal Shared Date is required.";
    }

    if (!form.clientProposalSharedTime) {
      return "Client Proposal Shared Time is required.";
    }

    if (!form.requirementName.trim()) {
      return "Requirement Name is required.";
    }

    if (!form.clientName.trim()) {
      return "Client Name is required.";
    }

    if (!form.requirementStatus) {
      return "Please select Requirement Status.";
    }

    if (!form.trainerName.trim()) {
      return "Trainer Name is required.";
    }

    if (!form.trainerContactDetails.trim()) {
      return "Trainer Contact Details are required.";
    }

    if (!form.evaluationCallStatus) {
      return "Please select Evaluation Call Status.";
    }

    return "";
  };

  /* =======================================================
     CREATE / UPDATE REQUIREMENT
     Backend endpoints expected:
       POST  /requirements
       PUT   /requirements/:id
  ======================================================= */

  const saveRequirement = async () => {
    const validationError = validateRequirementForm();

    if (validationError) {
      setTaskError(validationError);
      return;
    }

    setTaskSaving(true);
    setTaskError("");
    setTaskSuccess("");

    const form = requirementForm;

    const displayDate = formatDateDDMMYYYY(
      form.clientProposalSharedDate
    );

    const displayTime = formatTime12Hour(
      form.clientProposalSharedTime
    );

    const followUp1 = getFollowUpDate(
      form.clientProposalSharedDate,
      1,
      form.requirementName
    );

    const followUp2 = getFollowUpDate(
      form.clientProposalSharedDate,
      2,
      form.requirementName
    );

    const followUp3 = getFollowUpDate(
      form.clientProposalSharedDate,
      3,
      form.requirementName
    );

    const followUp4 = getFollowUpDate(
      form.clientProposalSharedDate,
      4,
      form.requirementName
    );

    const followUp5 = getFollowUpDate(
      form.clientProposalSharedDate,
      5,
      form.requirementName
    );

    try {
      /* ===================================================
         EDIT EXISTING REQUIREMENT
      =================================================== */

      if (editingRequirement) {
        const requirementId =
          editingRequirement.id ||
          editingRequirement.requirementId ||
          editingRequirement._id;

        if (!requirementId) {
          throw new Error(
            "This requirement does not have a unique ID. The backend must provide an id/requirementId/_id for editing."
          );
        }

        const updatedRequirement = {
          ...editingRequirement,

          sNo: form.sNo || editingRequirement.sNo,

          clientProposalSharedDate: displayDate,
          clientProposalSharedTime: displayTime,

          requirementName: form.requirementName.trim(),
          assignedOpsPerson: form.assignedOpsPerson,
          salesPerson: form.salesPerson,
          clientName: form.clientName.trim(),
          requirementStatus: form.requirementStatus,
          trainerName: form.trainerName.trim(),
          trainerContactDetails:
            form.trainerContactDetails.trim(),
          evaluationCallStatus: form.evaluationCallStatus,
          followUp: form.followUp.trim(),

          followUp1,
          followUp2,
          followUp3,
          followUp4,
          followUp5,
        };

        const payload = {
          requirementId,

          sNo: updatedRequirement.sNo,
          clientProposalSharedDate:
            updatedRequirement.clientProposalSharedDate,
          clientProposalSharedTime:
            updatedRequirement.clientProposalSharedTime,
          requirementName:
            updatedRequirement.requirementName,
          assignedOpsPerson:
            updatedRequirement.assignedOpsPerson,
          salesPerson: updatedRequirement.salesPerson,
          clientName: updatedRequirement.clientName,
          requirementStatus:
            updatedRequirement.requirementStatus,
          trainerName: updatedRequirement.trainerName,
          trainerContactDetails:
            updatedRequirement.trainerContactDetails,
          evaluationCallStatus:
            updatedRequirement.evaluationCallStatus,
          followUp: updatedRequirement.followUp,
          followUp1: updatedRequirement.followUp1,
          followUp2: updatedRequirement.followUp2,
          followUp3: updatedRequirement.followUp3,
          followUp4: updatedRequirement.followUp4,
          followUp5: updatedRequirement.followUp5,
        };

        const response = await fetch(
          `${apiBaseUrl}/requirements/${encodeURIComponent(
            requirementId
          )}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              `Unable to update requirement (${response.status}).`
          );
        }

        setLocalRows((previous) =>
          previous.map((row) => {
            const rowId =
              row.id ||
              row.requirementId ||
              row._id;

            return String(rowId) === String(requirementId)
              ? updatedRequirement
              : row;
          })
        );

        setTaskSuccess(
          "Requirement updated successfully in the source and dashboard."
        );

        setRequirementForm({
          ...EMPTY_REQUIREMENT_FORM,
        });

        setEditingRequirement(null);
        setTaskSaving(false);
        return;
      }

      /* ===================================================
         CREATE NEW REQUIREMENT
      =================================================== */

      const newId = `local-${Date.now()}`;

      const newRequirement = {
        id: newId,

        sNo:
          form.sNo ||
          String(localRows.length + 1),

        clientProposalSharedDate: displayDate,
        clientProposalSharedTime: displayTime,

        requirementName: form.requirementName.trim(),
        assignedOpsPerson: form.assignedOpsPerson,
        salesPerson: form.salesPerson,
        clientName: form.clientName.trim(),
        requirementStatus: form.requirementStatus,
        trainerName: form.trainerName.trim(),
        trainerContactDetails:
          form.trainerContactDetails.trim(),
        evaluationCallStatus:
          form.evaluationCallStatus,
        followUp: form.followUp.trim(),

        followUp1,
        followUp2,
        followUp3,
        followUp4,
        followUp5,
      };

      const payload = {
        requirementId: newId,

        sNo: newRequirement.sNo,
        clientProposalSharedDate:
          newRequirement.clientProposalSharedDate,
        clientProposalSharedTime:
          newRequirement.clientProposalSharedTime,
        requirementName:
          newRequirement.requirementName,
        assignedOpsPerson:
          newRequirement.assignedOpsPerson,
        salesPerson: newRequirement.salesPerson,
        clientName: newRequirement.clientName,
        requirementStatus:
          newRequirement.requirementStatus,
        trainerName: newRequirement.trainerName,
        trainerContactDetails:
          newRequirement.trainerContactDetails,
        evaluationCallStatus:
          newRequirement.evaluationCallStatus,
        followUp: newRequirement.followUp,
        followUp1: newRequirement.followUp1,
        followUp2: newRequirement.followUp2,
        followUp3: newRequirement.followUp3,
        followUp4: newRequirement.followUp4,
        followUp5: newRequirement.followUp5,

        taskTitle: `Task - ${newRequirement.requirementName}`,

        taskDescription: `Requirement: ${newRequirement.requirementName}
Client: ${newRequirement.clientName}
Assigned OPS: ${newRequirement.assignedOpsPerson || "Not Assigned"}
Sales Person: ${newRequirement.salesPerson || "Not Assigned"}`,

        dueDate: form.clientProposalSharedDate,
        taskStatus: "Pending",
      };

      /* IMPORTANT: save the requirement to the REQUIREMENTS endpoint first.
         The old code posted only to /tasks, so the row was local and never
         reached the Excel/source requirement data. */
      const response = await fetch(
        `${apiBaseUrl}/requirements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Unable to create requirement (${response.status}).`
        );
      }

      const savedRequirement =
        data?.requirement ||
        data?.data ||
        data?.row ||
        data ||
        {};

      const backendId =
        savedRequirement?.id ||
        savedRequirement?.requirementId ||
        savedRequirement?._id ||
        newId;

      setLocalRows((previous) => [
        ...previous,
        {
          ...newRequirement,
          ...savedRequirement,
          id: backendId,
          requirementId:
            savedRequirement?.requirementId || backendId,
        },
      ]);

      setTaskSuccess(
        "Requirement created successfully and saved to Excel/source and dashboard."
      );

      setRequirementForm({
        ...EMPTY_REQUIREMENT_FORM,
      });
    } catch (error) {
      console.error(
        "Save Requirement Error:",
        error
      );

      setTaskError(
        error?.message ||
          "Unable to save requirement."
      );
    } finally {
      setTaskSaving(false);
    }
  };

  /* =======================================================
     DELETE REQUIREMENT
     Backend endpoint expected:
       DELETE /requirements/:id
  ======================================================= */

  const requestDeleteRequirement = (row) => {
    setDeleteTarget(row);
  };

  const cancelDelete = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const deleteRequirement = async () => {
    if (!deleteTarget || deleteLoading) return;

    const requirementId =
      deleteTarget.id ||
      deleteTarget.requirementId ||
      deleteTarget._id;

    if (!requirementId) {
      setDeleteTarget(null);
      alert(
        "This requirement does not have a unique ID. The backend must provide an id/requirementId/_id for deletion."
      );
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/requirements/${encodeURIComponent(
          requirementId
        )}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Unable to delete requirement (${response.status}).`
        );
      }

      setLocalRows((previous) =>
        previous.filter((row) => {
          const rowId =
            row.id ||
            row.requirementId ||
            row._id;

          return String(rowId) !== String(requirementId);
        })
      );

      /* Remove old follow-up statuses for this row. */
      setFollowUpStatuses((previous) => {
        const updated = { ...previous };

        [1, 2, 3].forEach((number) => {
          delete updated[
            `${deleteTarget.sNo}-followup-${number}`
          ];
        });

        try {
          localStorage.setItem(
            "opsFollowUpStatuses",
            JSON.stringify(updated)
          );
        } catch {}

        return updated;
      });

      setDeleteTarget(null);
    } catch (error) {
      console.error(
        "Delete Requirement Error:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete requirement. The Excel/source data was not changed."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =======================================================
     AI COPILOT
  ======================================================= */

  const buildLocalCopilotAnswer = (question) => {
    const q = String(question || "").trim().toLowerCase();
    const total = localRows.length;

    const served = localRows.filter(
      (row) => String(row.requirementStatus || "").toLowerCase() === "served"
    ).length;

    const regret = localRows.filter(
      (row) => String(row.requirementStatus || "").toLowerCase() === "regret"
    ).length;

    const evaluationYes = localRows.filter(
      (row) => String(row.evaluationCallStatus || "").toLowerCase() === "yes"
    ).length;

    const clients = new Set(
      localRows
        .map((row) => String(row.clientName || "").trim())
        .filter(Boolean)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueToday = [];
    const overdue = [];

    localRows.forEach((row) => {
      FOLLOW_UP_CONFIG.forEach((config) => {
        const date = getFollowUpDateObject(
          row.clientProposalSharedDate,
          config.number,
          row.requirementName
        );

        if (!date) return;

        const status = getFollowUpStatus(row, config.number);
        if (status === "Accepted") return;

        const item = {
          number: config.number,
          date,
          requirement: row.requirementName || "Requirement",
          client: row.clientName || "—",
          ops: row.assignedOpsPerson || "—",
        };

        const time = date.getTime();
        if (time === today.getTime()) dueToday.push(item);
        if (time < today.getTime()) overdue.push(item);
      });
    });

    if (q.includes("total") && (q.includes("requirement") || q.includes("kitni"))) {
      return `Total requirements: ${total}. Served: ${served}. Regret: ${regret}.`;
    }

    if (q.includes("served") || q.includes("regret")) {
      return `Served: ${served} | Regret: ${regret} | Total: ${total}.`;
    }

    if (q.includes("evaluation")) {
      return `Evaluation calls marked Yes: ${evaluationYes}.`;
    }

    if (q.includes("client")) {
      if (!clients.size) return "No client names are available in the loaded requirements.";
      return `Total unique clients: ${clients.size}. Clients: ${Array.from(clients).join(", ")}.`;
    }

    if (q.includes("follow") || q.includes("aaj")) {
      if (dueToday.length === 0 && overdue.length === 0) {
        return "There are no pending follow-ups due today or overdue.";
      }

      const todayText = dueToday.length
        ? `Today (${dueToday.length}): ${dueToday
            .map((item) => `F${item.number} - ${item.requirement} (${item.client})`)
            .join("; ")}`
        : "Today: none";

      const overdueText = overdue.length
        ? `Overdue (${overdue.length}): ${overdue
            .map((item) => `F${item.number} - ${item.requirement} (${item.client})`)
            .join("; ")}`
        : "Overdue: none";

      return `${todayText}. ${overdueText}.`;
    }

    if (q.includes("summary") || q.includes("important") || q.includes("task")) {
      return `Dashboard summary: ${total} requirements, ${served} Served, ${regret} Regret, ${evaluationYes} evaluation calls marked Yes, and ${clients.size} unique clients. Pending follow-ups due today: ${dueToday.length}; overdue: ${overdue.length}.`;
    }

    return `I can help with your live dashboard. Current data: ${total} requirements, ${served} Served, ${regret} Regret, ${evaluationYes} evaluation calls, and ${clients.size} unique clients. Try asking about requirements, follow-ups, clients, evaluation calls, or today's summary.`;
  };

  const askCopilot = async (
    question = copilotQuestion
  ) => {
    const text = String(question || "").trim();

    if (!text || copilotLoading) return;

    setCopilotLoading(true);
    setCopilotError("");
    setCopilotAnswer("");

    try {
      let answer = "";

      try {
        const response = await fetch(
          `${apiBaseUrl}/copilot`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              question: text,
            }),
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.ok) {
          answer =
            data?.answer ||
            data?.response ||
            data?.message ||
            data?.result ||
            "";
        }
      } catch (backendError) {
        console.warn(
          "AI Copilot backend unavailable. Using live dashboard fallback.",
          backendError
        );
      }

      // The dashboard remains usable even if the backend /copilot route
      // is missing, offline, or returns an error.
      if (!answer) {
        answer = buildLocalCopilotAnswer(text);
      }

      setCopilotAnswer(String(answer));
      setCopilotQuestion("");
    } catch (error) {
      console.error(
        "AI Copilot Error:",
        error
      );

      setCopilotError(
        error?.message ||
          "Unable to generate an AI Copilot answer."
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

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredRows = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return localRows;
    }

    return localRows.filter((row) =>
      COLUMNS.some((column) => {
        if (column.key === "clientProposalSharedDate") {
          return formatDateDDMMYYYY(
            row.clientProposalSharedDate
          )
            .toLowerCase()
            .includes(searchValue);
        }

        if (column.key === "clientProposalSharedTime") {
          return formatTime12Hour(
            row.clientProposalSharedTime
          )
            .toLowerCase()
            .includes(searchValue);
        }

        if (
          column.key === "followUp1" ||
          column.key === "followUp2" ||
          column.key === "followUp3" ||
          column.key === "followUp4" ||
          column.key === "followUp5"
        ) {
          const followUpNumber = Number(
            column.key.replace("followUp", "")
          );

          return getFollowUpDate(
            row.clientProposalSharedDate,
            followUpNumber,
            row.requirementName
          )
            .toLowerCase()
            .includes(searchValue);
        }

        return String(row[column.key] ?? "")
          .toLowerCase()
          .includes(searchValue);
      })
    );
  }, [localRows, search]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const served = localRows.filter(
      (row) =>
        String(
          row.requirementStatus || ""
        ).toLowerCase() === "served"
    ).length;

    const regret = localRows.filter(
      (row) =>
        String(
          row.requirementStatus || ""
        ).toLowerCase() === "regret"
    ).length;

    const evaluationYes = localRows.filter(
      (row) =>
        String(
          row.evaluationCallStatus || ""
        ).toLowerCase() === "yes"
    ).length;

    const followUps = localRows.filter((row) =>
      FOLLOW_UP_CONFIG.some((config) =>
        getFollowUpDateObject(
          row.clientProposalSharedDate,
          config.number,
          row.requirementName
        )
      )
    ).length;

    const clients = new Set(
      localRows
        .map((row) =>
          String(
            row.clientName || ""
          ).trim()
        )
        .filter(Boolean)
    ).size;

    return {
      total: localRows.length,
      served,
      regret,
      evaluationYes,
      followUps,
      clients,
    };
  }, [localRows]);

  /* =======================================================
     FOLLOW UP NOTIFICATIONS
  ======================================================= */

  const allFollowUpNotifications = useMemo(() => {
    const list = [];

    localRows.forEach((row, rowIndex) => {
      FOLLOW_UP_CONFIG.forEach((config) => {
        const date = getFollowUpDateObject(
          row.clientProposalSharedDate,
          config.number,
          row.requirementName
        );

        if (!date) return;

        list.push({
          id: `${row.sNo || rowIndex}-${config.number}`,
          row,
          followUpNumber: config.number,
          followUpLabel: config.label,
          date,
          dateText: getFollowUpDate(
            row.clientProposalSharedDate,
            config.number,
            row.requirementName
          ),
          status: getFollowUpStatus(
            row,
            config.number
          ),
        });
      });
    });

    return list.sort(
      (a, b) =>
        a.date.getTime() -
        b.date.getTime()
    );
  }, [
    localRows,
    followUpStatuses,
  ]);

  /*
     FOLLOW-UP NOTIFICATION RULES

     - Notification dates come directly from the same working-day
       schedule used by the table.
     - Weekend dates can never be generated because the schedule
       moves them to the next working day.
     - A notification appears on its due date and remains visible
       on every later day until that exact follow-up is accepted.
     - "Declined" is still pending, so it also remains visible.
     - Updating the follow-up status updates this list immediately
       because followUpStatuses is part of the memo dependency.
  */
  const notifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allFollowUpNotifications.filter((item) => {
      // Accepted follow-ups are removed immediately.
      if (item.status === "Accepted") {
        return false;
      }

      // Future follow-ups are not notifications yet.
      if (item.date.getTime() > today.getTime()) {
        return false;
      }

      // Due today or overdue pending follow-ups stay visible
      // until the corresponding follow-up is accepted.
      return true;
    });
  }, [allFollowUpNotifications]);

  const isTodayWeekend = (() => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  })();

  /* =======================================================
     BADGES
  ======================================================= */

  const getStatusClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "served") return "status-served";
    if (value === "regret") return "status-regret";

    return "status-default";
  };

  const getEvaluationClass = (value) => {
    const result = String(
      value || ""
    ).toLowerCase();

    if (result === "yes") return "evaluation-yes";
    if (result === "no") return "evaluation-no";

    return "evaluation-default";
  };

  /* =======================================================
     TABLE CELL RENDERER
  ======================================================= */

  const renderTableCell = (row, column) => {
    if (
      column.key ===
      "clientProposalSharedDate"
    ) {
      return (
        <td
          key={column.key}
          className={column.className}
        >
          {formatDateDDMMYYYY(
            row.clientProposalSharedDate
          )}
        </td>
      );
    }

    if (
      column.key ===
      "clientProposalSharedTime"
    ) {
      return (
        <td
          key={column.key}
          className={column.className}
        >
          {formatTime12Hour(
            row.clientProposalSharedTime
          )}
        </td>
      );
    }

    if (
      column.key === "followUp1" ||
      column.key === "followUp2" ||
      column.key === "followUp3" ||
      column.key === "followUp4" ||
      column.key === "followUp5"
    ) {
      const number = Number(
        column.key.replace("followUp", "")
      );

      const status = getFollowUpStatus(
        row,
        number
      );

      return (
        <td
          key={column.key}
          className="followup-cell"
        >
          <div className="followup-date">
            {getFollowUpDate(
              row.clientProposalSharedDate,
              number,
              row.requirementName
            )}
          </div>

          {status && (
            <div
              className={`followup-decision-status ${
                status === "Accepted"
                  ? "accepted"
                  : "declined"
              }`}
            >
              {status === "Accepted"
                ? "✓ Accepted"
                : "× Declined"}
            </div>
          )}
        </td>
      );
    }

    const value = row[column.key];

    if (
      column.key ===
      "requirementStatus"
    ) {
      return (
        <td key={column.key}>
          <span
            className={`status-badge ${getStatusClass(
              value
            )}`}
          >
            {value || "—"}
          </span>
        </td>
      );
    }

    if (
      column.key ===
      "evaluationCallStatus"
    ) {
      return (
        <td key={column.key}>
          <span
            className={`evaluation-badge ${getEvaluationClass(
              value
            )}`}
          >
            {value || "—"}
          </span>
        </td>
      );
    }

    if (column.key === "sNo") {
      return (
        <td
          key={column.key}
          className={`${column.className} sno-cell`}
        >
          <span className="sno-badge">
            {value || "—"}
          </span>
        </td>
      );
    }

    return (
      <td key={column.key}>
        {value || "—"}
      </td>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="requirement-dashboard">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="dashboard-header">
        <div className="brand-section">
          <div className="brand-icon">▣</div>

          <div>
            <h1>OPS Requirement Tracker</h1>
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
                setSearch(e.target.value)
              }
            />
          </div>

          {/* NOTIFICATION */}

          <div className="notification-wrapper">
            <button
              type="button"
              className="notification-button"
              title="Pending Follow Up Notifications"
              onClick={() =>
                setNotificationOpen(
                  (previous) => !previous
                )
              }
            >
              🔔

              {notifications.length > 0 && (
                <span className="notification-count">
                  {notifications.length > 99
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
                      Pending Follow Ups
                    </h3>

                    <span>
                      {getTodayText()}
                    </span>

                    {isTodayWeekend && (
                      <div className="notification-weekend-note">
                        Weekend par new follow-up notifications generate nahi honge.
                        Pending notifications Accept hone tak visible rahengi.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="notification-close"
                    onClick={() =>
                      setNotificationOpen(false)
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">
                        ✓
                      </div>

                      <strong>
                        No pending follow-ups
                      </strong>

                      <span>
                        New follow-up notifications are generated on weekdays.
                        A pending notification stays visible until it is accepted.
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

                                <span>
                                  Assigned OPS:{" "}
                                  {row.assignedOpsPerson ||
                                    "Not provided"}
                                </span>

                                <span>
                                  Sales Person:{" "}
                                  {row.salesPerson ||
                                    "Not provided"}
                                </span>

                                <span>
                                  Client:{" "}
                                  {row.clientName ||
                                    "Not provided"}
                                </span>

                                <span>
                                  Client Proposal Shared:{" "}
                                  {formatDateDDMMYYYY(
                                    row.clientProposalSharedDate
                                  )}{" "}
                                  |{" "}
                                  {formatTime12Hour(
                                    row.clientProposalSharedTime
                                  )}
                                </span>

                                <small>
                                  {row.requirementName ||
                                    "Requirement"}
                                </small>
                              </div>
                            </div>

                            <div
                              className={`notification-date ${
                                getDateKey(notification.date) ===
                                getTodayKey()
                                  ? "today"
                                  : "overdue"
                              }`}
                            >
                              🔔 Follow-up Due:{" "}
                              {notification.dateText}
                              {
                                getDateKey(notification.date) !==
                                  getTodayKey() &&
                                " • Pending"
                              }
                            </div>

                            <div className="notification-actions">
                              <button
                                type="button"
                                className="accept-button"
                                onClick={() =>
                                  updateFollowUpStatus(
                                    row,
                                    notification.followUpNumber,
                                    "Accepted"
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
                                    "Declined"
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

          {/* AI COPILOT */}

          <div className="copilot-wrapper">
            <button
              type="button"
              className="copilot-button"
              onClick={() =>
                setCopilotOpen(
                  (previous) => !previous
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
                      <h3>AI Copilot</h3>

                      <span>
                        Ask about your live requirements
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="copilot-close"
                    onClick={() =>
                      setCopilotOpen(false)
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="copilot-questions">
                  {quickQuestions.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          askCopilot(question)
                        }
                      >
                        {question}
                      </button>
                    )
                  )}
                </div>

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
                        e.key === "Enter" &&
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

          {/* CREATE TASK */}

          <button
            type="button"
            className="create-task-header-button"
            onClick={openCreateTask}
          >
            ＋ Create Task
          </button>

          {/* PROFILE */}

          <div className="profile">
            <div className="profile-circle">
              SSDN
            </div>

            <span>Admin</span>
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="dashboard-content">
        {/* KPI */}

        <section className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">▤</div>

            <div>
              <span>Total Requirements</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">✓</div>

            <div>
              <span>Served</span>
              <strong>{stats.served}</strong>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">↗</div>

            <div>
              <span>Follow Up</span>
              <strong>{stats.followUps}</strong>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">☎</div>

            <div>
              <span>Evaluation Calls</span>
              <strong>
                {stats.evaluationYes}
              </strong>
            </div>
          </div>

          <div className="stat-card cyan">
            <div className="stat-icon">♙</div>

            <div>
              <span>Total Clients</span>
              <strong>{stats.clients}</strong>
            </div>
          </div>
        </section>

        {/* TABLE */}

        <section className="table-card">
          <div className="table-toolbar">
            <div>
              <h2>Requirement Tracker</h2>

              <p>
                Live data from Ops OND Requirement Tracker
              </p>
            </div>

          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className={column.className}
                    >
                      {column.label}
                    </th>
                  ))}

                  {/* ACTIONS AFTER FOLLOW UP 5 */}
                  <th className="col-actions">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        COLUMNS.length + 1
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
                        key={`${row.id || row.sNo}-${index}`}
                      >
                        {COLUMNS.map(
                          (column) =>
                            renderTableCell(
                              row,
                              column
                            )
                        )}

                        {/* EDIT / DELETE */}
                        <td className="actions-cell">
                          <div className="row-actions">
                            <button
                              type="button"
                              className="edit-row-button"
                              title="Edit requirement"
                              onClick={() =>
                                openEditRequirement(
                                  row
                                )
                              }
                            >
                              ✎ Edit
                            </button>

                            <button
                              type="button"
                              className="delete-row-button"
                              title="Delete requirement permanently"
                              onClick={() =>
                                requestDeleteRequirement(
                                  row
                                )
                              }
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing{" "}
              <strong>
                {filteredRows.length}
              </strong>{" "}
              of{" "}
              <strong>
                {localRows.length}
              </strong>{" "}
              requirements
            </span>

            <span>
              {localRows.length > 0
                ? "All Excel rows loaded"
                : "No Excel data"}
            </span>
          </div>
        </section>
      </main>

      {/* ===================================================
          CREATE / EDIT MODAL
      =================================================== */}

      {createTaskOpen && (
        <div
          className="create-task-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              closeCreateTask();
            }
          }}
        >
          <div className="create-task-modal">
            <div className="create-task-modal-header">
              <div>
                <h2>
                  {editingRequirement
                    ? "✎ Edit Requirement"
                    : "＋ Create Task"}
                </h2>

                <p>
                  {editingRequirement
                    ? "Update requirement details and save changes"
                    : "Enter complete requirement details"}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeCreateTask}
              >
                ×
              </button>
            </div>

            <div className="create-task-modal-body">
              <div className="form-info-box">
                <strong>
                  {editingRequirement
                    ? "Edit Requirement Form"
                    : "Requirement Entry Form"}
                </strong>

                <span>
                  {editingRequirement
                    ? "Make the required changes below. Save will update the source data and dashboard."
                    : "Fill in the requirement details below. After submitting, the new requirement will appear in the dashboard."}
                </span>
              </div>

              <div className="requirement-form-grid">
                {/* S.NO */}

                <div className="requirement-form-field">
                  <label>S.No.</label>

                  <input
                    type="text"
                    value={
                      requirementForm.sNo
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "sNo",
                        e.target.value
                      )
                    }
                    placeholder="Enter S.No."
                  />
                </div>

                {/* DATE */}

                <div className="requirement-form-field">
                  <label>
                    Client Proposal Shared Date
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    value={
                      requirementForm.clientProposalSharedDate
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "clientProposalSharedDate",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* TIME */}

                <div className="requirement-form-field">
                  <label>
                    Client Proposal Shared Time
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="time"
                    value={
                      requirementForm.clientProposalSharedTime
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "clientProposalSharedTime",
                        e.target.value
                      )
                    }
                  />

                  {requirementForm.clientProposalSharedTime && (
                    <small className="time-preview">
                      Display:{" "}
                      {formatTime12Hour(
                        requirementForm.clientProposalSharedTime
                      )}
                    </small>
                  )}
                </div>

                {/* REQUIREMENT */}

                <div className="requirement-form-field form-field-wide">
                  <label>
                    Requirement Name
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      requirementForm.requirementName
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "requirementName",
                        e.target.value
                      )
                    }
                    placeholder="Enter requirement name"
                  />
                </div>

                {/* OPS */}

                <div className="requirement-form-field">
                  <label>
                    Assigned OPS Person
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <select
                    value={
                      requirementForm.assignedOpsPerson
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "assignedOpsPerson",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select OPS Person
                    </option>

                    {OPS_PERSONS.map(
                      (person) => (
                        <option
                          key={person}
                          value={person}
                        >
                          {person}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* SALES */}

                <div className="requirement-form-field">
                  <label>
                    Sales Person
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <select
                    value={
                      requirementForm.salesPerson
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "salesPerson",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Sales Person
                    </option>

                    {SALES_PERSONS.map(
                      (person) => (
                        <option
                          key={person}
                          value={person}
                        >
                          {person}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* CLIENT */}

                <div className="requirement-form-field">
                  <label>
                    Client Name
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      requirementForm.clientName
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "clientName",
                        e.target.value
                      )
                    }
                    placeholder="Enter client name"
                  />
                </div>

                {/* STATUS */}

                <div className="requirement-form-field">
                  <label>
                    Requirement Status
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <select
                    value={
                      requirementForm.requirementStatus
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "requirementStatus",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Status
                    </option>

                    {REQUIREMENT_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* TRAINER */}

                <div className="requirement-form-field">
                  <label>
                    Trainer Name
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      requirementForm.trainerName
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "trainerName",
                        e.target.value
                      )
                    }
                    placeholder="Enter trainer name"
                  />
                </div>

                {/* CONTACT */}

                <div className="requirement-form-field form-field-wide">
                  <label>
                    Trainer Contact Details
                    (Mail ID & Phn. No.)
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      requirementForm.trainerContactDetails
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "trainerContactDetails",
                        e.target.value
                      )
                    }
                    placeholder="Email ID & Phone Number"
                  />
                </div>

                {/* EVALUATION */}

                <div className="requirement-form-field">
                  <label>
                    Evaluation Call Status
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <select
                    value={
                      requirementForm.evaluationCallStatus
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "evaluationCallStatus",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Yes / No
                    </option>

                    {EVALUATION_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* FOLLOW UP */}

                <div className="requirement-form-field form-field-wide">
                  <label>Follow Up</label>

                  <input
                    type="text"
                    value={
                      requirementForm.followUp
                    }
                    onChange={(e) =>
                      updateRequirementForm(
                        "followUp",
                        e.target.value
                      )
                    }
                    placeholder="Enter follow-up information"
                  />
                </div>
              </div>

              {/* AUTOMATIC FOLLOW-UP PREVIEW */}

              {requirementForm.clientProposalSharedDate && (
                <div className="followup-preview-box">
                  <div className="followup-preview-title">
                    Automatic Follow-Up Dates
                  </div>

                  <div className="followup-preview-grid">
                    {[1, 2, 3, 4, 5].map((number) => (
                      <div key={number}>
                        <span>Follow Up {number}</span>
                        <strong>
                          {getFollowUpDate(
                            requirementForm.clientProposalSharedDate,
                            number,
                            requirementForm.requirementName
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {taskError && (
                <div className="task-error">
                  <strong>Error</strong>

                  <span>{taskError}</span>
                </div>
              )}

              {taskSuccess && (
                <div className="task-success">
                  <strong>
                    ✓ Success
                  </strong>

                  <span>
                    {taskSuccess}
                  </span>
                </div>
              )}
            </div>

            <div className="create-task-modal-footer">
              <button
                type="button"
                className="task-cancel-button"
                onClick={closeCreateTask}
                disabled={taskSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="task-create-button"
                onClick={saveRequirement}
                disabled={taskSaving}
              >
                {taskSaving
                  ? editingRequirement
                    ? "Saving..."
                    : "Creating..."
                  : editingRequirement
                  ? "✓ Save Changes"
                  : "✓ Create Task / Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE CONFIRMATION MODAL
      =================================================== */}

      {deleteTarget && (
        <div
          className="delete-confirm-overlay"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              cancelDelete();
            }
          }}
        >
          <div className="delete-confirm-modal">
            <div className="delete-confirm-icon">
              🗑
            </div>

            <h2>Delete Requirement?</h2>

            <p>
              Are you sure you want to permanently
              delete this requirement?
            </p>

            <div className="delete-requirement-preview">
              <strong>
                {deleteTarget.requirementName ||
                  "Requirement"}
              </strong>

              <span>
                S.No. {deleteTarget.sNo || "—"}
              </span>

              <span>
                Client:{" "}
                {deleteTarget.clientName ||
                  "—"}
              </span>
            </div>

            <div className="delete-warning">
              This will delete the requirement from
              the source/backend and remove it from
              the dashboard. This action cannot be
              undone.
            </div>

            <div className="delete-confirm-actions">
              <button
                type="button"
                className="delete-cancel-button"
                onClick={cancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={deleteRequirement}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
