import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import RequirementDashboard from "./RequirementDashboard";

// =====================================================
// API BASE URL
// Local:
// http://localhost:5000/api
//
// Production:
// REACT_APP_API_BASE_URL from Vercel
// =====================================================

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

function App() {
  const [requirementRows, setRequirementRows] = useState([]);

  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(null);

  // =====================================================
  // LOAD REQUIREMENTS FROM MYSQL API
  // =====================================================

  const loadRequirements = useCallback(async () => {
    try {
      setLoading(true);

      const apiUrl =
        `${API_BASE_URL}/requirements?t=${Date.now()}`;

      console.log("Calling Requirement API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      // -------------------------------------------------
      // Read response safely
      // -------------------------------------------------

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "API returned non-JSON response:",
          text
        );

        throw new Error(
          `API returned ${response.status} instead of JSON`
        );
      }

      const result = await response.json();

      // -------------------------------------------------
      // Validate API response
      // -------------------------------------------------

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

      // -------------------------------------------------
      // ALL rows from Railway MySQL
      // -------------------------------------------------

      const rows = Array.isArray(result.data)
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

  // =====================================================
  // FIRST LOAD
  // =====================================================

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  // =====================================================
  // AUTOMATIC REFRESH
  // EVERY 3 SECONDS
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      loadRequirements();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [loadRequirements]);

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <RequirementDashboard
      rows={requirementRows}
      onRefresh={loadRequirements}
      loading={loading}
      lastUpdated={lastUpdated}
    />
  );
}

export default App;