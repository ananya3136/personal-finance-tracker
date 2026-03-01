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
import AIChatbot from "./AIChatbot";
import ExportButton from "./ExportButton";
import CategoryChart from "./CategoryChart";
import ThemeToggle from "./ThemeToggle";
const CURRENT_MONTH = "2026-02";
const CIRCUMFERENCE = 2 * Math.PI * 90;

const useCountUp = (value, duration = 800) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const counter = setInterval(() => {
      start += increment;
      if (start >= value) { start = value; clearInterval(counter); }
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
      setTimeout(() => { ringRef.current.style.strokeDashoffset = offset; }, 100);
    }
  }, [offset]);
  return (
    <div className="health-score__ring">
      <svg viewBox="0 0 200 200" width="200" height="200">
        <circle className="ring-bg" cx="100" cy="100" r="90" />
        <circle ref={ringRef} className="ring-fill" cx="100" cy="100" r="90"
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: CIRCUMFERENCE }} />
      </svg>
      <div className="health-score__inner">
        <div className="health-score__number">{score}</div>
        <div className="health-score__out-of">out of 100</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background:"rgba(15,23,42,0.9)", backdropFilter:"blur(12px)", borderRadius:"14px", padding:"14px 18px", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 0 25px rgba(0,0,0,0.5)" }}>
      {payload.map((entry, index) => (
        <div key={index} style={{ marginBottom:"6px", color:entry.fill, fontWeight:600, fontSize:"16px" }}>
          {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: ₹{entry.value}
        </div>
      ))}
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState("this");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  const incomeAnimated = useCountUp(analytics?.income || 0);
  const expenseAnimated = useCountUp(analytics?.expense || 0);
  const savingsAnimated = useCountUp(analytics?.savings || 0);

  const chartData = analytics ? [{ name:"Overview", income:analytics.income||0, expense:analytics.expense||0, savings:analytics.savings||0 }] : [];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    const loadData = async () => {
      const headers = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };
      try {
        setLoading(true);
        setError(null);
        const [healthRes, predictionRes, transactionRes, recommendationRes, analyticsRes, categoryRes] =
          await Promise.all([
            fetch(`/api/health-score?month=${CURRENT_MONTH}`, { headers }),
            fetch(`/api/predict?month=${CURRENT_MONTH}`, { headers }),
            fetch(`/api/transactions`, { headers }),
            fetch(`/api/recommendations?month=${CURRENT_MONTH}`, { headers }),
            fetch(`/api/analytics?range=${range}`, { headers }),
            fetch(`/api/transactions/category-summary`, { headers }),
          ]);
        if (healthRes.ok) setHealth(await healthRes.json());
        if (predictionRes.ok) setPrediction(await predictionRes.json());
        else setPredictionError("Prediction failed.");
        if (transactionRes.ok) setTransactions(await transactionRes.json());
        if (recommendationRes.ok) setRecommendation(await recommendationRes.json());
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (categoryRes.ok) setCategoryData(await categoryRes.json());
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
      try {
        const insightRes = await fetch(`/api/ai/insights`, { headers });
        if (insightRes.ok) { const data = await insightRes.json(); setAiInsight(data.insight); }
      } catch (err) { console.error("AI insight load error:", err); }
    };

    loadData();
  }, [navigate, range]);

  const handleLogout = () => { localStorage.removeItem("token"); 
     localStorage.removeItem("userName");  
    localStorage.removeItem("userEmail"); 
    navigate("/"); };

  return (
    <div className="dashboard">
      <div className="dashboard__content">
        <header className="dashboard__header">
  <div className="dashboard__header-left">
    <h1 className="dashboard__title">Dashboard</h1>
    <ThemeToggle />
  </div>
  <div className="dashboard__actions">
    <ExportButton transactions={transactions} />
    <button className="btn btn--secondary" onClick={() => navigate("/budget")}>🎯 Budgets</button>
    <button className="btn btn--primary" onClick={() => navigate("/add-transaction")}>+ Add</button>
    <button className="btn btn--secondary" onClick={() => navigate("/profile")}>👤 Profile</button>
    <button className="btn btn--secondary" onClick={handleLogout}>Logout</button>
  </div>
</header>

        {error && <div className="error">{error}</div>}

        {loading && (
          <div className="skeleton-wrapper">
            <div className="skeleton-card">
              <div className="skeleton-label"></div>
              <div className="skeleton-ring-wrap"><div className="skeleton-ring"></div></div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-card">
              <div className="skeleton-label"></div>
              <div className="skeleton-grid"><div className="skeleton-stat"></div><div className="skeleton-stat"></div></div>
              <div className="skeleton-line"></div>
            </div>
            <div className="skeleton-card">
              <div className="skeleton-label"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line skeleton-line--short"></div>
            </div>
            <div className="skeleton-card">
              <div className="skeleton-label"></div>
              <div className="skeleton-grid"><div className="skeleton-stat"></div><div className="skeleton-stat"></div><div className="skeleton-stat"></div></div>
              <div className="skeleton-chart"></div>
            </div>
            <div className="skeleton-card">
              <div className="skeleton-label"></div>
              {[1,2,3,4].map(i => (
                <div key={i} className="skeleton-tx-row">
                  <div className="skeleton-tx-left">
                    <div className="skeleton-dot"></div>
                    <div><div className="skeleton-line skeleton-line--med"></div><div className="skeleton-line skeleton-line--xs"></div></div>
                  </div>
                  <div className="skeleton-line skeleton-line--short"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {health && !loading && (
          <div className="card health-card">
            <div className="card__header"><h3>Financial Health</h3></div>
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
              <div><span className="label">Spent</span><div className="value value--danger">&#8377;{prediction.currentExpense}</div></div>
              <div><span className="label">Projected</span><div className="value value--warning">&#8377;{prediction.projectedExpense}</div></div>
            </div>
            <p className="prediction-message">{prediction.message}</p>
          </div>
        )}

        {recommendation && !loading && (
          <div className="card recommendation-card">
            <div className="recommendation-header">
              <div>
                <h3 className="recommendation-title">🤖 Smart Savings Advice</h3>
                <p className="recommendation-subtitle">AI-powered monthly analysis</p>
              </div>
              <div className="savings-badge">
                {recommendation?.savingsRate || 0}%
                <span>Savings Rate</span>
              </div>
            </div>
            <div className="recommendation-body">
              <div className="recommendation-chip">
                Top Expense:
                <span className="recommendation-chip__value">{recommendation?.topExpenseCategory || "No expense data"}</span>
              </div>
              <p className="recommendation-text">{recommendation?.advice || ""}</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="ai-insight-card">
            <div className="ai-insight-header">
              <div className="ai-insight-icon">🧠</div>
              <div>
                <h3 className="ai-insight-title">AI Financial Intelligence</h3>
                <p className="ai-insight-sub">Powered by your financial data</p>
              </div>
            </div>
            <div className="ai-insight-body">
              {aiInsight ? (
                aiInsight.split(/\n+/).filter(line => line.trim()).map((line, i) => {
                  const headerMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)/);
                  if (headerMatch) {
                    return (
                      <div key={i} className="ai-insight-section">
                        <div className="ai-insight-section-label">{headerMatch[1]}</div>
                        {headerMatch[2] && (
                          <p className="ai-insight-section-text"
                            dangerouslySetInnerHTML={{ __html: headerMatch[2].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                        )}
                      </div>
                    );
                  }
                  return (
                    <p key={i} className="ai-insight-plain"
                      dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                  );
                })
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"8px 0" }}>
                  <div style={{ width:"20px", height:"20px", borderRadius:"50%", border:"2px solid #334155", borderTopColor:"#00e5a0", animation:"spin 0.8s linear infinite" }} />
                  <p style={{ color:"#4a5a7a", fontStyle:"italic", margin:0 }}>Analyzing your finances... this may take a moment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {analytics && !loading && (
          <div className="glass-card analytics-glass">
            <div className="glass-header">
              <h3>Financial Overview</h3>
              <div className="glass-dropdown">
                <div className="glass-dropdown-selected" onClick={() => setOpenDropdown(!openDropdown)}>
                  {range === "this" && "This Month"}
                  {range === "last" && "Last Month"}
                  {range === "all" && "All Time"}
                  <span className="arrow">▾</span>
                </div>
                {openDropdown && (
                  <div className="glass-dropdown-menu">
                    <div onClick={() => { setRange("this"); setOpenDropdown(false); }}>This Month</div>
                    <div onClick={() => { setRange("last"); setOpenDropdown(false); }}>Last Month</div>
                    <div onClick={() => { setRange("all"); setOpenDropdown(false); }}>All Time</div>
                  </div>
                )}
              </div>
            </div>
            <div className="glass-stats">
              <div className="stat income"><span>Income</span><h2>₹{incomeAnimated}</h2></div>
              <div className="stat expense"><span>Expense</span><h2>₹{expenseAnimated}</h2></div>
              <div className="stat savings"><span>Savings</span><h2>₹{savingsAnimated}</h2></div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22e6a0" /><stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d6d" /><stop offset="100%" stopColor="#ff8fa3" />
                  </linearGradient>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#facc15" /><stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="income" fill="url(#incomeGradient)" radius={[12,12,0,0]} animationDuration={1000} />
                <Bar dataKey="expense" fill="url(#expenseGradient)" radius={[12,12,0,0]} animationDuration={1000} />
                <Bar dataKey="savings" fill="url(#savingsGradient)" radius={[12,12,0,0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && <CategoryChart categoryData={categoryData} />}

        {!loading && transactions.length > 0 && (
          <div className="card transactions-card">
            <div className="card__header"><h3>Recent Transactions</h3></div>
            <div className="transactions-list">
              {transactions.map((txn) => (
                <div key={txn._id} id={txn._id} className="transaction-row">
                  <div className="transaction-left">
                    <div className={`transaction-dot transaction-dot--${txn.type}`} />
                    <div>
                      <div className="transaction-category">{txn.category}</div>
                      <div className="transaction-date">{new Date(txn.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="transaction-right">
                    <div className={`transaction-amount transaction-amount--${txn.type}`}>
                      {txn.type === "income" ? "+" : "-"} ₹{txn.amount}
                    </div>
                    <button className="delete-btn" onClick={async (e) => {
                      const button = e.currentTarget;
                      const ripple = document.createElement("span");
                      ripple.classList.add("ripple");
                      const rect = button.getBoundingClientRect();
                      ripple.style.left = `${e.clientX - rect.left}px`;
                      ripple.style.top = `${e.clientY - rect.top}px`;
                      button.appendChild(ripple);
                      setTimeout(() => ripple.remove(), 600);
                      const token = localStorage.getItem("token");
                      const row = document.getElementById(txn._id);
                      row.classList.add("transaction-row--removing");
                      setTimeout(async () => {
                        await fetch(`/api/transactions/${txn._id}`, {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        setTransactions(prev => prev.filter(t => t._id !== txn._id));
                      }, 300);
                    }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <AIChatbot />
    </div>
  );
}

export default Dashboard;
