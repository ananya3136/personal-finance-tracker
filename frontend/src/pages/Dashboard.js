import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const CURRENT_MONTH = "2026-02";
const CIRCUMFERENCE = 2 * Math.PI * 90;

function getGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

function HealthRing({ score }) {
  const ringRef = useRef(null);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  useEffect(() => {
    if (ringRef.current) {
      setTimeout(() => {
        ringRef.current.style.strokeDashoffset = offset;
      }, 100);
    }
  }, [offset]);

  return (
    <div className="health-score__ring">
      <svg viewBox="0 0 200 200" width="200" height="200">
        <circle className="ring-bg" cx="100" cy="100" r="90" />
        <circle
          ref={ringRef}
          className="ring-fill"
          cx="100"
          cy="100"
          r="90"
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: CIRCUMFERENCE }}
        />
      </svg>
      <div className="health-score__inner">
        <div className="health-score__number">{score}</div>
        <div className="health-score__out-of">out of 100</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const [health, setHealth] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
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

      try {
        setLoading(true);
        setError(null);

        const [healthRes, predictionRes, alertRes, transactionRes] =
          await Promise.all([
            fetch(`/api/health-score?month=${CURRENT_MONTH}`, { headers }),
            fetch(`/api/predict?month=${CURRENT_MONTH}`, { headers }),
            fetch(`/api/alerts`, { headers }),
            fetch(`/api/transactions`, { headers }),
          ]);

        if (healthRes.ok) {
          const data = await healthRes.json();
          setHealth(data);
        }

        if (predictionRes.ok) {
          const data = await predictionRes.json();
          setPrediction(data);
        } else {
          setPredictionError("Prediction failed.");
        }

        if (alertRes.ok) {
          const alertData = await alertRes.json();
          setAlerts(alertData);
        }

        if (transactionRes.ok) {
          const transactionData = await transactionRes.json();
          setTransactions(transactionData);
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

  return (
    <div className="dashboard">
      <div className="dashboard__content">

        <header className="dashboard__header">
          <h1 className="dashboard__title">Dashboard</h1>
          <div className="dashboard__actions">
            <button
              className="btn btn--primary"
              onClick={() => navigate("/add-transaction")}
            >
              + Add Transaction
            </button>
            <button
              className="btn btn--secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {loading && <div className="loading">Loading your financial data...</div>}
        {error && <div className="error">{error}</div>}

        {health && !loading && (
          <div className="card health-card">
            <div className="card__header">
              <h3>Financial Health</h3>
            </div>
            <div className="health-score">
              <HealthRing score={health.score} />
              <div className="health-score__badge">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Grade {getGrade(health.score)}
              </div>
              <div className="health-score__text">{health.message}</div>
            </div>
          </div>
        )}

        {prediction && !loading && (
          <div className="card prediction-card">
            <div className="card__header">
              <h3>Spending Prediction</h3>
              <div className="card__header-icon">&#128200;</div>
            </div>
            <div className="prediction-stats">
              <div>
                <span className="label">Spent</span>
                <div className="value value--danger">
                  &#8377;{prediction.currentExpense}
                </div>
              </div>
              <div>
                <span className="label">Projected</span>
                <div className="value value--warning">
                  &#8377;{prediction.projectedExpense}
                </div>
              </div>
            </div>
            <p className="prediction-message">{prediction.message}</p>
          </div>
        )}

        {!loading && (
          <div className="card alert-card">
            <div className="card__header">
              <h3>Budget Alerts</h3>
            </div>
            {alerts.length > 0 ? (
              <div className="alert-list">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`alert-item alert-item--${alert.type ? alert.type.toLowerCase() : "info"}`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert-empty">All budgets are on track</div>
            )}
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <div className="card transactions-card">
            <div className="card__header">
              <h3>Recent Transactions</h3>
            </div>
            <div className="transactions-list">
          {transactions.map((txn) => (
 <div key={txn._id} id={txn._id} className="transaction-row">

    <div className="transaction-left">
      <div className={`transaction-dot transaction-dot--${txn.type}`} />
      <div>
        <div className="transaction-category">
          {txn.category}
        </div>
        <div className="transaction-date">
          {new Date(txn.date).toLocaleDateString()}
        </div>
      </div>
    </div>

    <div className="transaction-right">
      <div className={`transaction-amount transaction-amount--${txn.type}`}>
        {txn.type === "income" ? "+" : "-"} ₹{txn.amount}
      </div>
<button
  className="delete-btn"
  onClick={async (e) => {
    const button = e.currentTarget;

    // Create ripple element
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");

    const rect = button.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    const token = localStorage.getItem("token");

    const row = document.getElementById(txn._id);
    row.classList.add("transaction-row--removing");

    setTimeout(async () => {
      await fetch(`/api/transactions/${txn._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions(prev =>
        prev.filter(t => t._id !== txn._id)
      );
    }, 300);
  }}
>
  ✕
</button>

    </div>
  </div>
))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
