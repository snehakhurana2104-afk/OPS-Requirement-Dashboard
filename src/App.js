import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import RequirementDashboard from "./RequirementDashboard";

function App() {
  const [requirementRows, setRequirementRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  /*
  =====================================================
  LOAD ALL EXCEL DATA
  =====================================================
  */

  const loadRequirements =
    useCallback(async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/requirements?t=" +
            Date.now(),
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load Excel data"
          );
        }

        /*
         * ALL rows from Excel
         */
        setRequirementRows(
          Array.isArray(result.data)
            ? result.data
            : []
        );

        setLastUpdated(
          new Date()
        );

        console.log(
          "Excel rows:",
          result.data.length
        );

        console.log(
          "Excel data:",
          result.data
        );
      } catch (error) {
        console.error(
          "Excel connection error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /*
  =====================================================
  FIRST LOAD
  =====================================================
  */

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  /*
  =====================================================
  AUTOMATIC REFRESH
  EVERY 3 SECONDS
  =====================================================
  */

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadRequirements();
      }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [loadRequirements]);

  /*
  =====================================================
  DASHBOARD
  =====================================================
  */

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