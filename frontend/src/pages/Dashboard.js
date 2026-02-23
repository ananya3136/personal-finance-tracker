import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Cell } from "recharts";


const CURRENT_MONTH = "2026-02";
const CIRCUMFERENCE = 2 * Math.PI * 90;


const useCountUp = (value, duration = 800) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= value) {
        start = value;
        clearInterval(counter);
      }
      setDisplayValue(Math.floor(start));
    }, 16);

    return () => clearInterval(counter);
  }, [value, duration]);

  return displayValue;
};


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
  const [recommendation, setRecommendation] = useState(null);
  const[analytics, setAnalytics] = useState([]);
  const[range, setRange]= useState("this");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Animated values
const incomeAnimated = useCountUp(analytics?.income || 0);
const expenseAnimated = useCountUp(analytics?.expense || 0);
const savingsAnimated = useCountUp(analytics?.savings || 0);

const [openDropdown, setOpenDropdown] = useState(false);
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

        const [healthRes, predictionRes, alertRes, transactionRes,recommendationRes,analyticsRes] =
          await Promise.all([
            fetch(`/api/health-score?month=${CURRENT_MONTH}`, { headers }),
            fetch(`/api/predict?month=${CURRENT_MONTH}`, { headers }),
            fetch(`/api/alerts`, { headers }),
            fetch(`/api/transactions`, { headers }),
            fetch(`/api/recommendations?month=${CURRENT_MONTH}`, { headers }),
            fetch(`/api/analytics?range=${range}`, { headers }),
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
        if (recommendationRes.ok) {
  const recData = await recommendationRes.json();
  setRecommendation(recData);
}
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
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
{recommendation && !loading && (
  <div className="card recommendation-card">
    <div className="recommendation-header">
      <div>
        <h3 className="recommendation-title">
          🤖 Smart Savings Advice
        </h3>
        <p className="recommendation-subtitle">
          AI-powered monthly analysis
        </p>
      </div>

      <div className="savings-badge">
        {recommendation?.savingsRate || 0}%
        <span>Savings Rate</span>
      </div>
    </div>

    <div className="recommendation-body">
      <div className="recommendation-chip">
        Top Expense:
        <span className="recommendation-chip__value">
          {recommendation?.topExpenseCategory || "No expense data"}
        </span>
      </div>

      <p className="recommendation-text">
        {recommendation?.advice || ""}
      </p>
    </div>
  </div>
)}





        {!loading && (
          <div className="card alert-card">
            <div className="card__header">
              <h3>Budget Alerts</h3>
            </div>
           {alerts.length === 0 && (
  <div className="alert-smart">
    <div className="alert-smart__icon">✅</div>

    <div className="alert-smart__content">
      <h4 className="alert-smart__title">
        All budgets are on track
      </h4>

      <p className="alert-smart__subtitle">
        You're managing your spending well this month.
      </p>

      <div className="alert-smart__meta">
        ✔ No categories exceeded  
        ✔ No warning thresholds triggered
      </div>
    </div>
  </div>
)}
</div>
        )}
       {analytics && !loading && (
  <div className="glass-card analytics-glass">

    <div className="glass-header">
      <h3>Financial Overview</h3>
<div className="glass-dropdown">
  <div
    className="glass-dropdown-selected"
    onClick={() => setOpenDropdown(!openDropdown)}
  >
    {range === "this" && "This Month"}
    {range === "last" && "Last Month"}
    {range === "all" && "All Time"}
    <span className="arrow">▾</span>
  </div>

  {openDropdown && (
    <div className="glass-dropdown-menu">
      <div onClick={() => { setRange("this"); setOpenDropdown(false); }}>
        This Month
      </div>
      <div onClick={() => { setRange("last"); setOpenDropdown(false); }}>
        Last Month
      </div>
      <div onClick={() => { setRange("all"); setOpenDropdown(false); }}>
        All Time
      </div>
    </div>
  )}
</div>
     
    </div>

    <div className="glass-stats">
      <div className="stat income">
        <span>Income</span>
        <h2>₹{incomeAnimated}</h2>
      </div>
      <div className="stat expense">
        <span>Expense</span>
        <h2>₹{expenseAnimated}</h2>
      </div>
      <div className="stat savings">
        <span>Savings</span>
        <h2>₹{savingsAnimated}</h2>
      </div>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={[
          { name: "Income", value: analytics.income },
          { name: "Expense", value: analytics.expense },
          { name: "Savings", value: analytics.savings },
        ]}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="name" stroke="#cbd5e1" />
        <YAxis stroke="#cbd5e1" />
        <Tooltip
          contentStyle={{
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff",
          }}
        />
        <Bar
          dataKey="value"
          radius={[16, 16, 0, 0]}
          animationDuration={1200}
        >
          <Cell fill="#22e6a0" />
          <Cell fill="#ff4d6d" />
          <Cell fill="#f5a623" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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
