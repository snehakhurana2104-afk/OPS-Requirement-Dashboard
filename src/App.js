import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import RequirementDashboard from "./RequirementDashboard";
import Sidebar from "./Sidebar";
import FollowUpsJAS2026 from "./FollowUpsJAS2026";

import "./App.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [requirementRows, setRequirementRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const loadRequirements =
    useCallback(async () => {
      try {
        setLoading(true);

        const apiUrl =
          `${API_BASE_URL}/requirements?t=${Date.now()}`;

        console.log(
          "Calling Requirement API:",
          apiUrl
        );

        const response =
          await fetch(apiUrl, {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          });

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "API returned non-JSON response:",
            text
          );

          throw new Error(
            `API returned ${response.status} instead of JSON`
          );
        }

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              `API request failed with status ${response.status}`
          );
        }

        if (!result.success) {
          throw new Error(
            result.message ||
              "Requirement API returned unsuccessful response"
          );
        }

        const rows =
          Array.isArray(result.data)
            ? result.data
            : [];

        setRequirementRows(rows);
        setLastUpdated(new Date());

        console.log(
          "Railway MySQL rows:",
          rows.length
        );

        console.log(
          "Railway MySQL data:",
          rows
        );
      } catch (error) {
        console.error(
          "Requirement API connection error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadRequirements();
      }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [loadRequirements]);

  return (
    <div className="app-shell">

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="app-main">

        {activePage === "dashboard" ? (
          <RequirementDashboard
            rows={requirementRows}
            onRefresh={loadRequirements}
            loading={loading}
            lastUpdated={lastUpdated}
            apiBaseUrl={API_BASE_URL}
          />
        ) : (
          <FollowUpsJAS2026 />
        )}

      </main>

    </div>
  );
}

export default App;