import React, { useEffect, useMemo, useState } from "react";
import "./FollowUpsJAS2026.css";

const STORAGE_KEY = "opsFollowUpsJAS2026RowsV1";
const STATUS_KEY = "opsFollowUpsJAS2026DecisionsV1";

const OPS_PERSONS = ["Kamal", "Tisha", "Sneha", "Abhishek"];
const SALES_PERSONS = ["Prabodh", "Amit", "Srishti", "Rakhi"];
const REQUIREMENT_STATUSES = ["Served", "Regret"];
const EVALUATION_STATUSES = ["Yes", "No"];

const EMPTY_FORM = {
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
};

const parseDate = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const text = String(value).trim();
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
    const [y, m, d] = text.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  let match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const formatDate = (value) => {
  const date = parseDate(value);
  if (!date) return "—";
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

const formatInputDate = (value) => {
  const date = parseDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const isSpecial = (name) => /\b(HCL|EXL|BNP|LTM|UCB)\b/i.test(String(name || ""));

const nextWorkingDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  while (result.getDay() === 0 || result.getDay() === 6) result.setDate(result.getDate() + 1);
  return result;
};

const followUpSchedule = (baseValue, requirementName) => {
  const base = parseDate(baseValue);
  if (!base) return [];
  const special = isSpecial(requirementName);
  const gaps = special ? [3, 4, 4, 4, 4] : [2, 2, 5, 5, 5];
  let previous = new Date(base);
  return gaps.map((gap, index) => {
    const calculated = new Date(previous);
    calculated.setDate(calculated.getDate() + gap);
    const actual = nextWorkingDay(calculated);
    previous = actual;
    return { number: index + 1, date: actual };
  });
};

const normalizeRows = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row, index) => ({
    ...row,
    sNo: row.sNo ?? index + 1,
  }));

function FollowUpsJAS2026({ rows = [] }) {
  const [localRows, setLocalRows] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return Array.isArray(saved) ? saved : normalizeRows(rows);
    } catch {
      return normalizeRows(rows);
    }
  });

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [decisionMap, setDecisionMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STATUS_KEY) || "{}"); } catch { return {}; }
  });

  // First visit only: import the current Dashboard data into this page's own store.
  // After that, Dashboard changes do not overwrite this page.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved && Array.isArray(rows) && rows.length) {
        const imported = normalizeRows(rows);
        setLocalRows(imported);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      }
    } catch {}
  }, [rows]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(localRows)); } catch {}
  }, [localRows]);

  useEffect(() => {
    try { localStorage.setItem(STATUS_KEY, JSON.stringify(decisionMap)); } catch {}
  }, [decisionMap]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = !q ? localRows : localRows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => {
      const da = parseDate(a.clientProposalSharedDate)?.getTime() ?? -Infinity;
      const db = parseDate(b.clientProposalSharedDate)?.getTime() ?? -Infinity;
      return db - da;
    });
  }, [localRows, search]);

  const stats = useMemo(() => ({
    total: localRows.length,
    served: localRows.filter((r) => String(r.requirementStatus || "").toLowerCase() === "served").length,
    evaluations: localRows.filter((r) => String(r.evaluationCallStatus || "").toLowerCase() === "yes").length,
    clients: new Set(localRows.map((r) => String(r.clientName || "").trim()).filter(Boolean)).size,
  }), [localRows]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sNo: String(localRows.length + 1) });
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id ?? row.sNo);
    setForm({
      ...EMPTY_FORM,
      ...row,
      clientProposalSharedDate: formatInputDate(row.clientProposalSharedDate),
    });
    setShowForm(true);
  };

  const save = (event) => {
    event.preventDefault();
    const cleaned = { ...form };
    const id = editingId ?? `jas-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    cleaned.id = id;
    if (editingId === null) {
      setLocalRows((previous) => [...previous, cleaned]);
    } else {
      setLocalRows((previous) => previous.map((row) => ((row.id ?? row.sNo) === editingId ? cleaned : row)));
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const remove = (row) => {
    if (!window.confirm(`Delete ${row.requirementName || "this requirement"} from Follow Ups JAS'2026 only?`)) return;
    const key = row.id ?? row.sNo;
    setLocalRows((previous) => previous.filter((item) => (item.id ?? item.sNo) !== key));
  };

  const decision = (row, number, value) => {
    const key = `${row.id ?? row.sNo}-followup-${number}`;
    setDecisionMap((previous) => ({ ...previous, [key]: value }));
  };

  const clearPageData = () => {
    if (!window.confirm("This clears only Follow Ups JAS'2026 data. Dashboard data will not be changed. Continue?")) return;
    setLocalRows([]);
    setDecisionMap({});
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STATUS_KEY); } catch {}
  };

  return (
    <div className="jas-page">
      <header className="jas-header">
        <div>
          <div className="jas-eyebrow">JAS 2026 • SEPARATE WORKSPACE</div>
          <h1>Follow Ups JAS'2026</h1>
          <p>Independent Requirement Tracker. Dashboard data is not modified by this page.</p>
        </div>
        <div className="jas-header-actions">
          <button className="jas-secondary-button" type="button" onClick={clearPageData}>Clear This Page</button>
          <button className="jas-primary-button" type="button" onClick={openCreate}>+ Create Requirement</button>
        </div>
      </header>

      <section className="jas-stats">
        <div><span>Total Requirements</span><strong>{stats.total}</strong></div>
        <div><span>Served</span><strong>{stats.served}</strong></div>
        <div><span>Evaluation Calls</span><strong>{stats.evaluations}</strong></div>
        <div><span>Total Clients</span><strong>{stats.clients}</strong></div>
      </section>

      <section className="jas-card">
        <div className="jas-toolbar">
          <div><h2>Requirement Tracker</h2><p>Own data store for Follow Ups JAS'2026</p></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requirement, client, OPS..." />
        </div>

        <div className="jas-table-wrap">
          <table>
            <thead><tr>
              <th>S.No.</th><th>Client Proposal Shared Date</th><th>Client Proposal Shared Time</th><th>Requirement Name</th>
              <th>Assigned OPS Person</th><th>Sales Person</th><th>Client Name</th><th>Requirement Status</th>
              <th>Trainer Name</th><th>Trainer Contact Details</th><th>Evaluation Call</th>
              <th>Follow Up 1</th><th>Follow Up 2</th><th>Follow Up 3</th><th>Follow Up 4</th><th>Follow Up 5</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr><td colSpan="17" className="jas-empty">No Follow Ups JAS'2026 records yet. Use Create Requirement or import Dashboard data on first visit.</td></tr>
              ) : filteredRows.map((row) => {
                const schedule = followUpSchedule(row.clientProposalSharedDate, row.requirementName);
                return (
                  <tr key={row.id ?? row.sNo}>
                    <td>{row.sNo || "—"}</td>
                    <td>{formatDate(row.clientProposalSharedDate)}</td>
                    <td>{row.clientProposalSharedTime || "—"}</td>
                    <td>{row.requirementName || "—"}</td>
                    <td>{row.assignedOpsPerson || "—"}</td>
                    <td>{row.salesPerson || "—"}</td>
                    <td>{row.clientName || "—"}</td>
                    <td><span className={`jas-badge ${String(row.requirementStatus || "").toLowerCase()}`}>{row.requirementStatus || "—"}</span></td>
                    <td>{row.trainerName || "—"}</td>
                    <td>{row.trainerContactDetails || "—"}</td>
                    <td>{row.evaluationCallStatus || "—"}</td>
                    {schedule.map((item) => {
                      const key = `${row.id ?? row.sNo}-followup-${item.number}`;
                      const decisionValue = decisionMap[key];
                      return <td key={item.number}>
                        <div className="jas-followup-cell">
                          <strong>{formatDate(item.date)}</strong>
                          {decisionValue ? <span className={`jas-decision ${decisionValue.toLowerCase()}`}>{decisionValue}</span> : null}
                          <div className="jas-decision-buttons">
                            <button type="button" onClick={() => decision(row, item.number, "Accepted")}>Accept</button>
                            <button type="button" onClick={() => decision(row, item.number, "Declined")}>Decline</button>
                          </div>
                        </div>
                      </td>;
                    })}
                    <td><div className="jas-actions"><button type="button" onClick={() => openEdit(row)}>Edit</button><button type="button" onClick={() => remove(row)}>Delete</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && <div className="jas-modal-backdrop" onMouseDown={() => setShowForm(false)}>
        <form className="jas-modal" onSubmit={save} onMouseDown={(e) => e.stopPropagation()}>
          <div className="jas-modal-header"><div><h3>{editingId === null ? "Create Requirement" : "Edit Requirement"}</h3><span>Saved only inside Follow Ups JAS'2026</span></div><button type="button" onClick={() => setShowForm(false)}>×</button></div>
          <div className="jas-form-grid">
            <label>S.No.<input value={form.sNo} onChange={(e) => setForm({ ...form, sNo: e.target.value })} /></label>
            <label>Proposal Date<input type="date" value={form.clientProposalSharedDate} onChange={(e) => setForm({ ...form, clientProposalSharedDate: e.target.value })} /></label>
            <label>Proposal Time<input type="time" value={form.clientProposalSharedTime || ""} onChange={(e) => setForm({ ...form, clientProposalSharedTime: e.target.value })} /></label>
            <label>Requirement Name<input required value={form.requirementName} onChange={(e) => setForm({ ...form, requirementName: e.target.value })} /></label>
            <label>Assigned OPS Person<select value={form.assignedOpsPerson} onChange={(e) => setForm({ ...form, assignedOpsPerson: e.target.value })}><option value="">Select</option>{OPS_PERSONS.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label>Sales Person<select value={form.salesPerson} onChange={(e) => setForm({ ...form, salesPerson: e.target.value })}><option value="">Select</option>{SALES_PERSONS.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label>Client Name<input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></label>
            <label>Requirement Status<select value={form.requirementStatus} onChange={(e) => setForm({ ...form, requirementStatus: e.target.value })}><option value="">Select</option>{REQUIREMENT_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label>Trainer Name<input value={form.trainerName} onChange={(e) => setForm({ ...form, trainerName: e.target.value })} /></label>
            <label>Trainer Contact Details<input value={form.trainerContactDetails} onChange={(e) => setForm({ ...form, trainerContactDetails: e.target.value })} /></label>
            <label>Evaluation Call Status<select value={form.evaluationCallStatus} onChange={(e) => setForm({ ...form, evaluationCallStatus: e.target.value })}><option value="">Select</option>{EVALUATION_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></label>
          </div>
          <div className="jas-modal-actions"><button type="button" className="jas-secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="jas-primary-button" type="submit">Save Requirement</button></div>
        </form>
      </div>}
    </div>
  );
}

export default FollowUpsJAS2026;
