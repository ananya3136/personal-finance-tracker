import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchHealthScore();
  }, [navigate]);

  const fetchHealthScore = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      const response = await API.get(
        "/health-score?month=2026-02",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHealth(response.data);
    } catch (err) {
      console.error("Health score error:", err);
      setError("Failed to load health score.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Dashboard</h2>

      <button
        onClick={handleLogout}
        style={{
          marginBottom: "20px",
          padding: "8px 15px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {loading && <p>Loading health score...</p>}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {health && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            maxWidth: "400px",
          }}
        >
          <h3>Financial Health Score</h3>
          <p><strong>Score:</strong> {health.score}</p>
          <p><strong>Grade:</strong> {health.grade}</p>
          <p>{health.message}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
