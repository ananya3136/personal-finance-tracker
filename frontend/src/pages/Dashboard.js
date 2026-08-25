import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
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
import {
  Sparkles,
  Wallet,
  Target,
  Plus,
  User,
  LogOut,
  TrendingUp,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Award,
  Activity,
  ChevronDown,
  X,
} from "lucide-react";
import AIChatbot from "./AIChatbot";
import ExportButton from "./ExportButton";
import CategoryChart from "./CategoryChart";
import ThemeToggle from "./ThemeToggle";

const API_BASE = "http://localhost:5000/api";
const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const CIRCUMFERENCE = 2 * Math.PI * 90;

function getGrade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}



function HealthRing({ score }) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  return (
    <div className="health-score__ring">
      <svg viewBox="0 0 200 200" width="180" height="180">
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E599" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id="healthGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle className="ring-bg" cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
        <circle 
          className="ring-fill" 
          cx="100" 
          cy="100" 
          r="90"
          stroke="url(#healthGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          filter="url(#healthGlow)"
          style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: offset, transition: "stroke-dashoffset 1s ease-out" }} 
        />
      </svg>
      <div className="health-score__inner">
        <div className="text-4xl font-extrabold text-white font-mono leading-none">{score}</div>
        <div className="text-xs text-gray-400 font-medium mt-1">out of 100</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="chart-tooltip-glass">
      {payload.map((entry, index) => (
        <div key={index} className="chart-tooltip-glass__row" style={{ color: entry.fill }}>
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

  const userName = (typeof window !== "undefined" && localStorage.getItem("userName")) || "";

  const balance = (analytics?.income || 0) - (analytics?.expense || 0);

  const chartData = analytics ? [{ name: "Overview", income: analytics.income || 0, expense: analytics.expense || 0, savings: analytics.savings || 0 }] : [];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    const loadData = async () => {
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      try {
        setLoading(true);
        setError(null);
        const [healthRes, predictionRes, transactionRes, recommendationRes, analyticsRes, categoryRes] =
          await Promise.all([
            fetch(`${API_BASE}/health-score?month=${CURRENT_MONTH}`, { headers }),
            fetch(`${API_BASE}/predict?month=${CURRENT_MONTH}`, { headers }),
            fetch(`${API_BASE}/transactions`, { headers }),
            fetch(`${API_BASE}/recommendations?month=${CURRENT_MONTH}`, { headers }),
            fetch(`${API_BASE}/analytics?range=${range}`, { headers }),
            fetch(`${API_BASE}/transactions/category-summary`, { headers }),
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
        const insightRes = await fetch(`${API_BASE}/ai/insights`, { headers });
        if (insightRes.ok) { const data = await insightRes.json(); setAiInsight(data.insight); }
      } catch (err) { console.error("AI insight load error:", err); }
    };

    loadData();
  }, [navigate, range]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <div className="dashboard-container w-full max-w-7xl mx-auto px-4 py-8 space-y-6 min-h-screen relative">
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="w-full max-w-7xl flex items-center justify-between py-4 mb-4 border-b border-white/10 relative z-10 flex-wrap gap-4">
        {/* Left: Finova Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-center shadow-lg transition-transform hover:rotate-[-6deg] hover:scale-105">
            <svg width="28" height="28" viewBox="0 0 64 64">
              <rect x="6" y="6" width="52" height="52" rx="16" fill="#181818" stroke="#2c2c2c" strokeWidth="2" />
              <path d="M22 18H42V24H28V31H38V37H28V46H22V18Z" fill="#22C55E" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white leading-none tracking-tight">FINOVA</h2>
            <p className="text-[10px] text-gray-400 tracking-[0.25em] uppercase mt-0.5">SMART FINANCE</p>
          </div>
        </div>

        {/* Right: Date selector, Theme switch, Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Selector */}
          <div className="relative">
            <button 
              onClick={() => setOpenDropdown(!openDropdown)}
              className="navbar-action-btn flex items-center gap-2"
            >
              <Sparkles size={15} className="text-emerald-400" />
              <span>
                {range === "this" && "This Month"}
                {range === "last" && "Last Month"}
                {range === "all" && "All Time"}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {openDropdown && (
                <motion.div
                  className="absolute top-full right-0 mt-2 w-44 bg-[#080C0B]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <div 
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-emerald-500/15 hover:text-emerald-400 ${range === "this" ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "text-gray-300"}`}
                    onClick={() => { setRange("this"); setOpenDropdown(false); }}
                  >
                    This Month
                  </div>
                  <div 
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-emerald-500/15 hover:text-emerald-400 ${range === "last" ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "text-gray-300"}`}
                    onClick={() => { setRange("last"); setOpenDropdown(false); }}
                  >
                    Last Month
                  </div>
                  <div 
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-emerald-500/15 hover:text-emerald-400 ${range === "all" ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "text-gray-300"}`}
                    onClick={() => { setRange("all"); setOpenDropdown(false); }}
                  >
                    All Time
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />

          {/* Action Buttons */}
          <button 
            className="navbar-action-btn navbar-action-btn--primary" 
            onClick={() => navigate("/add-transaction")}
          >
            <Plus size={16} /> Add
          </button>

          <ExportButton transactions={transactions} />

          <button 
            className="navbar-action-btn" 
            onClick={() => navigate("/budget")}
          >
            <Target size={15} className="text-emerald-400" /> Budgets
          </button>

          <button 
            className="navbar-action-btn" 
            onClick={() => navigate("/profile")}
          >
            <User size={15} className="text-gray-300" /> {userName ? userName : "Profile"}
          </button>

          <button 
            className="navbar-action-btn hover:border-red-500/40 hover:text-red-400" 
            onClick={handleLogout}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      {/* 2. GREETING BANNER SECTION */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit mb-3">
            <Sparkles size={13} /> FINOVA • Live Dashboard
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Welcome back{userName ? `, ${userName}` : ""}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="inline-block animate-wave drop-shadow-[0_0_10px_#00E599]">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E599" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path d="M12 2a1 1 0 0 1 1 1v7.5a.5.5 0 0 0 1 0V3a1 1 0 0 1 2 0v7.5a.5.5 0 0 0 1 0V4.5a1 1 0 0 1 2 0v7.5a.5.5 0 0 0 1 0V7a1 1 0 0 1 2 0v8a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7v-6a1 1 0 0 1 1-1h.08a1 1 0 0 1 .92.62L8 11.5a.5.5 0 0 0 1-.36V3a1 1 0 0 1 1-1Z" fill="url(#waveGradient)" />
            </svg>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here's your financial overview for today.</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div className="w-full max-w-7xl p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Total Balance Card */}
        <div className="dashboard-metric-card bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ₹<CountUp end={balance} duration={1} separator="," />
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <TrendingUp size={13} /> Active balance overview
          </div>
        </div>

        {/* Total Income Card */}
        <div className="dashboard-metric-card bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            ₹<CountUp end={analytics?.income || 0} duration={1} separator="," />
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">
            Earnings & cash inflows
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="dashboard-metric-card bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Expense</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight font-mono">
            ₹<CountUp end={analytics?.expense || 0} duration={1} separator="," />
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">
            Outflows & expenditures
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="dashboard-metric-card bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Net Savings</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight font-mono">
            ₹<CountUp end={analytics?.savings || 0} duration={1} separator="," />
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">
            Retained capital
          </div>
        </div>
      </div>

      {/* 4. 2-COLUMN MAIN DASHBOARD AREA */}
      <div className="dashboard-main-grid w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

          {/* LEFT COLUMN (Span 8 Cols) */}
          <div className="dashboard-left-col w-full lg:col-span-8 space-y-6">
            {/* Main Financial Overview Chart */}
            {analytics && (
              <div className="w-full dashboard-card bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Activity size={18} className="text-emerald-400" /> Financial Overview
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Comparison of income, expense, and net savings</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
                    <Sparkles size={13} /> {range === "this" ? "This Month" : range === "last" ? "Last Month" : "All Time"}
                  </div>
                </div>

                <div className="w-full min-w-0 h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E599" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF5C5C" />
                          <stop offset="100%" stopColor="#DC2626" />
                        </linearGradient>
                        <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FBBF24" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748B" />
                      <YAxis stroke="#64748B" />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Bar dataKey="income" fill="url(#incomeGradient)" radius={[12, 12, 4, 4]} animationDuration={1000} />
                      <Bar dataKey="expense" fill="url(#expenseGradient)" radius={[12, 12, 4, 4]} animationDuration={1000} />
                      <Bar dataKey="savings" fill="url(#savingsGradient)" radius={[12, 12, 4, 4]} animationDuration={1000} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Spending Category Breakdown */}
            <div className="w-full">
              <CategoryChart categoryData={categoryData} />
            </div>
          </div>

          {/* RIGHT COLUMN (Span 4 Cols) */}
          <div className="dashboard-right-col w-full lg:col-span-4 space-y-6">
            {/* Financial Health Gauge */}
            {health && (
              <div className="dashboard-card health-card text-center bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <h3 className="text-base font-semibold text-gray-100 tracking-wide flex items-center gap-2">
                    <Award size={15} className="text-emerald-400" /> Financial Health
                  </h3>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Grade {getGrade(health.score)}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-4 py-2">
                  <HealthRing score={health.score} />
                  <p className="text-sm text-gray-300 text-center max-w-xs leading-relaxed">{health.message}</p>
                </div>
              </div>
            )}

            {/* Spending Projection Card */}
            {prediction && (
              <div className="dashboard-card bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <h3 className="text-base font-semibold text-gray-100 tracking-wide flex items-center gap-2">
                    <TrendingUp size={15} className="text-amber-400" /> Spending Projection
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Spent</span>
                    <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">₹{prediction.currentExpense}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Projected</span>
                    <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">₹{prediction.projectedExpense}</div>
                  </div>
                </div>
                {predictionError && <p className="text-xs text-rose-400 mt-1">{predictionError}</p>}
                <p className="text-sm text-gray-300 leading-relaxed mt-1">{prediction.message}</p>
              </div>
            )}

            {/* AI Intelligence Card */}
            <div className="dashboard-card ai-insight-card bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-100 tracking-wide">AI Financial Intelligence</h3>
                  <p className="text-xs text-emerald-400 font-medium">Smart Automated Insights</p>
                </div>
              </div>

              <div className="text-sm text-gray-300 space-y-3 max-h-72 overflow-y-auto pr-1">
                {aiInsight ? (
                  aiInsight.split(/\n+/).filter(line => line.trim()).map((line, i) => {
                    const headerMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)/);
                    if (headerMatch) {
                      return (
                        <div key={i} className="bg-white/5 border border-white/5 border-l-2 border-l-emerald-500 rounded-r-xl p-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">{headerMatch[1]}</div>
                          {headerMatch[2] && (
                            <p className="text-sm text-gray-300 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: headerMatch[2].replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
                          )}
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="text-sm text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-gray-400">Analyzing your finances...</p>
                  </div>
                )}

                {recommendation && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                      <div>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Savings Rate</span>
                        <div className="text-lg font-bold text-emerald-400">{recommendation.savingsRate}%</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Top Expense</span>
                        <div className="text-xs font-medium text-rose-400">{recommendation.topExpenseCategory || "N/A"}</div>
                      </div>
                    </div>
                    {recommendation.advice && (
                      <p className="text-sm text-gray-300 italic mt-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                        "{recommendation.advice}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions Stream */}
            {transactions.length > 0 && (
              <div className="dashboard-card bg-[#121815] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <h3 className="text-base font-semibold text-gray-100 tracking-wide flex items-center gap-2">
                    <Wallet size={15} className="text-emerald-400" /> Recent Activity
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">{transactions.length} items</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {transactions.map((txn) => (
                    <div key={txn._id} id={txn._id} className="transaction-row flex items-center justify-between p-3 rounded-xl bg-[#111715]/70 border border-white/5 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center ${txn.type === "income" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-[#FF5C5C] border border-rose-500/20"}`}>
                          {txn.type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white tracking-tight">{txn.category}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{new Date(txn.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`font-mono text-sm font-bold ${txn.type === "income" ? "text-[#00E599]" : "text-[#FF5C5C]"}`}>
                          {txn.type === "income" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN")}
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
                          if (row) row.classList.add("transaction-row--removing");
                          setTimeout(async () => {
                            await fetch(`${API_BASE}/transactions/${txn._id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            setTransactions(prev => prev.filter(t => t._id !== txn._id));
                          }, 300);
                        }}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      {/* Floating AI Chatbot Assistant */}
      <AIChatbot />
    </div>
  );
}

export default Dashboard;