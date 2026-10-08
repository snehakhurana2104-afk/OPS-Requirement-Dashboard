import React, { useState } from "react";
import "./Sidebar.css";

function Sidebar({ activePage = "dashboard", onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = (page) => {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    }

    // On smaller screens, close sidebar after selecting a page.
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* OPEN BUTTON - ALWAYS AVAILABLE WHEN SIDEBAR IS CLOSED */}
      {!sidebarOpen && (
        <button
          type="button"
          className="sidebar-open-toggle"
          aria-label="Open sidebar"
          aria-expanded="false"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
      )}

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-mobile-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`app-sidebar ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        aria-hidden={!sidebarOpen}
      >
        {/* BRAND */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">OPS</div>

          <div className="sidebar-brand-copy">
            <strong>OPS CONTROL</strong>
            <span>Requirement Management</span>
          </div>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            className="sidebar-close-toggle"
            aria-label="Close sidebar"
            aria-expanded="true"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* SECTION */}
        <div className="sidebar-section-label">
          WORKSPACE
        </div>

        {/* NAVIGATION */}
        <nav
          className="sidebar-nav"
          aria-label="Primary navigation"
        >
          <button
            type="button"
            className={`sidebar-nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => navigate("dashboard")}
          >
            <span className="sidebar-nav-icon">▣</span>

            <span className="sidebar-nav-text">
              Dashboard
            </span>

            <span className="sidebar-nav-arrow">
              ›
            </span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${
              activePage === "followups" ? "active" : ""
            }`}
            onClick={() => navigate("followups")}
          >
            <span className="sidebar-nav-icon">◷</span>

            <span className="sidebar-nav-text">
              Follow Ups JAS'2026
            </span>

            <span className="sidebar-nav-arrow">
              ›
            </span>
          </button>
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-line" />

          <span>
            Operations • Executive View
          </span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;