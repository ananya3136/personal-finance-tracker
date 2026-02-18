import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const CURRENT_MONTH = "2026-02";

function Dashboard() {
  const navigate = useNavigate();

  const [health, setHealth] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    
      const baseUrl = "/api";
    
      try {
        setLoading(true);
        setError(null);
    
        const [healthRes, predictionRes, alertRes] = await Promise.all([
          fetch(`${baseUrl}/health-score?month=${CURRENT_MONTH}`, { headers }),
          fetch(`${baseUrl}/predict?month=${CURRENT_MONTH}`, { headers }),
          fetch(`${baseUrl}/alerts`, { headers }),
        ]);
    
        if (
          healthRes.status === 401 ||
          predictionRes.status === 401 ||
          alertRes.status === 401
        ) {
          setError("Unauthorized. Please login again.");
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
    
        if (healthRes.ok) {
          const data = await healthRes.json();
          setHealth(data);
        }
    
        if (predictionRes.ok) {
          const data = await predictionRes.json();
          setPrediction(data);
          setPredictionError(null);
        } else {
          setPrediction(null);
          setPredictionError("Prediction failed.");
        }
    
        if (alertRes.ok) {
          const alertData = await alertRes.json();
          setAlerts(alertData);
        }
    
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getGradeClass = (grade) => {
    if (!grade) return "grade-badge--a";
    const letter = grade.toUpperCase().charAt(0);
    if (letter === "A") return "grade-badge--a";
    if (letter === "B") return "grade-badge--b";
    if (letter === "C") return "grade-badge--c";
    return "grade-badge--d";
  };

  return (
    <div className="dashboard">
      <div className="dashboard__content">
        <header className="dashboard__header">
          <h1 className="dashboard__title">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="dashboard__logout"
            type="button"
          >
            Logout
          </button>
        </header>

        {loading && (
          <div className="dashboard__loading">
            <div className="loading-spinner" />
            <p className="loading-text">Loading your financial health...</p>
          </div>
        )}

        {error && <div className="dashboard__error">{error}</div>}

        {health && !loading && (
          <div className="health-card">
            <div className="score-gauge">
              <div
                className="score-gauge__ring"
                style={{ "--score-percent": health.score || 0 }}
              >
                <div className="score-gauge__value">
                  <span className="score-gauge__number">{health.score}</span>
                  <span className="score-gauge__label">out of 100</span>
                </div>
              </div>
              <span className={`grade-badge ${getGradeClass(health.grade)}`}>
                <span className="health-card__icon">★</span>
                Grade {health.grade}
              </span>
            </div>
            <p className="health-card__message">{health.message}</p>
          </div>
        )}

        {(prediction || predictionError) && !loading && (
          <div className="prediction-card">
            <div className="prediction-card__header">
              <h3 className="prediction-card__title">Spending prediction</h3>
              <span className="prediction-card__icon">📊</span>
            </div>
            {predictionError ? (
              <p className="prediction-card__message prediction-card__message--center prediction-card__message--error">
                {predictionError}
              </p>
            ) : prediction.projectedExpense !== undefined ? (
              <>
                {prediction.paceStatus && (
                  <span className={`prediction-card__status prediction-card__status--${prediction.paceStatus}`}>
                    {prediction.paceStatus === "on_track" && "✓ On track"}
                    {prediction.paceStatus === "ahead" && "↓ Ahead of pace"}
                    {prediction.paceStatus === "watch" && "! Watch spending"}
                    {prediction.paceStatus === "over" && "↑ Over pace"}
                  </span>
                )}
                <div className="prediction-card__progress">
                  <div
                    className={`prediction-card__progress-bar prediction-card__progress-bar--${prediction.paceStatus || "on_track"}`}
                    style={{
                      width: `${(prediction.daysPassed / prediction.daysInMonth) * 100}%`,
                    }}
                  />
                  <span className="prediction-card__progress-label">
                    Day {prediction.daysPassed} of {prediction.daysInMonth} · {prediction.daysRemaining ?? prediction.daysInMonth - prediction.daysPassed} days left
                  </span>
                </div>
                <div className="prediction-card__stats">
                  <div className="prediction-card__stat">
                    <span className="prediction-card__stat-label">Spent so far</span>
                    <span className="prediction-card__stat-value prediction-card__stat-value--current">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(prediction.currentExpense)}
                    </span>
                    {prediction.dailyAverage != null && (
                      <span className="prediction-card__stat-hint">
                        ~{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(parseFloat(prediction.dailyAverage))}/day
                      </span>
                    )}
                  </div>
                  <div className="prediction-card__stat">
                    <span className="prediction-card__stat-label">Projected this month</span>
                    <span className="prediction-card__stat-value prediction-card__stat-value--projected">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(parseFloat(prediction.projectedExpense))}
                    </span>
                    {prediction.projectedRemaining != null && (
                      <span className="prediction-card__stat-hint">
                        ~{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(parseFloat(prediction.projectedRemaining))} left to spend
                      </span>
                    )}
                  </div>
                </div>
                <p className="prediction-card__message">{prediction.message}</p>
                {prediction.tip && (
                  <div className="prediction-card__tip">
                    <span className="prediction-card__tip-icon">💡</span>
                    <span>{prediction.tip}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="prediction-card__message prediction-card__message--center">
                {prediction.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
