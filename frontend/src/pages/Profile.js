import API_BASE from "../config";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const CURRENT_MONTH = "2026-02";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric"
  });
}

function AnimatedNumber({ value, prefix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const increment = end / (900 / 16);
    const counter = setInterval(() => {
      start += increment;
      if (start >= end) { start = end; clearInterval(counter); }
      setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(counter);
  }, [value]);
  return <span>{prefix}{display.toLocaleString("en-IN")}</span>;
}

function MiniRing({ score }) {
  const ringRef = useRef(null);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  useEffect(() => {
    if (ringRef.current) {
      setTimeout(() => { ringRef.current.style.strokeDashoffset = offset; }, 200);
    }
  }, [offset]);

  return (
    <svg viewBox="0 0 64 64" width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle
        ref={ringRef}
        cx="32" cy="32" r={r}
        fill="none"
        stroke="var(--accent-green, #00e5a0)"
        strokeWidth="4"
        strokeLinecap="round"
        style={{
          strokeDasharray: circ,
          strokeDashoffset: circ,
          transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)",
          filter: "drop-shadow(0 0 4px var(--accent-green, #00e5a0))"
        }}
      />
    </svg>
  );
}

function Profile() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [summary, setSummary]   = useState(null);
  const [health, setHealth]     = useState(null);
  const [txnCount, setTxnCount] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    // Read user info saved at login time — no extra API call needed
    const savedName    = localStorage.getItem("userName");
    const savedEmail   = localStorage.getItem("userEmail");
    const savedJoined  = localStorage.getItem("userCreatedAt");

    setUser({
      name:      savedName  || "Finance User",
      email:     savedEmail || "—",
      createdAt: savedJoined || null,
    });

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const load = async () => {
      try {
        setLoading(true);

        const [summaryRes, healthRes, txnRes] = await Promise.all([
          fetch("/api/transactions/summary", { headers }),
          fetch(`/api/health-score?month=${CURRENT_MONTH}`, { headers }),
          fetch("/api/transactions", { headers }),
        ]);

        if (summaryRes.ok) setSummary(await summaryRes.json());
        if (healthRes.ok)  setHealth(await healthRes.json());
        if (txnRes.ok) {
          const txns = await txnRes.json();
          setTxnCount(txns.length);
        }

      } catch (err) {
        console.error("Profile load error:", err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const savingsRate = summary && summary.totalIncome > 0
    ? (((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100).toFixed(1)
    : 0;

  const grade = !health ? "—"
    : health.score >= 80 ? "A"
    : health.score >= 60 ? "B"
    : health.score >= 40 ? "C" : "D";

  return (
    <div className="profile-page">
      <div className="profile-wrap">

        {/* Nav */}
        <div className="profile-nav">
          <button className="profile-nav__back" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <span className="profile-nav__label">My Profile</span>
        </div>

        {loading && (
          <div className="profile-skeletons">
            <div className="skel skel--hero" />
            <div className="skel-row">
              <div className="skel skel--stat" />
              <div className="skel skel--stat" />
              <div className="skel skel--stat" />
              <div className="skel skel--stat" />
            </div>
            <div className="skel skel--details" />
          </div>
        )}

        {error && <div className="profile-error">{error}</div>}

        {!loading && user && (
          <>
            {/* HERO */}
            <div className="profile-hero">
              <div className="profile-avatar">
                <span className="profile-avatar__initials">{getInitials(user.name)}</span>
              </div>

              <div className="profile-hero__info">
                <h1 className="profile-hero__name">{user.name}</h1>
                <p className="profile-hero__email">{user.email}</p>
                <div className="profile-hero__chips">
                  <span className="chip chip--green">✓ Active</span>
                  {user.createdAt && (
                    <span className="chip chip--blue">
                      Since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              {health && (
                <div className="profile-score">
                  <div className="profile-score__ring-wrap">
                    <MiniRing score={health.score} />
                    <div className="profile-score__overlay">
                      <span className="profile-score__num">{health.score}</span>
                      <span className="profile-score__grade">{grade}</span>
                    </div>
                  </div>
                  <span className="profile-score__label">Health</span>
                </div>
              )}
            </div>

            {/* STATS */}
            {summary && (
              <div className="profile-stats">
                <div className="pstat pstat--income">
                  <span className="pstat__label">Total Income</span>
                  <span className="pstat__value pstat__value--income">
                    <AnimatedNumber value={summary.totalIncome} prefix="₹" />
                  </span>
                </div>
                <div className="pstat pstat--expense">
                  <span className="pstat__label">Total Spent</span>
                  <span className="pstat__value pstat__value--expense">
                    <AnimatedNumber value={summary.totalExpense} prefix="₹" />
                  </span>
                </div>
                <div className="pstat pstat--savings">
                  <span className="pstat__label">Net Savings</span>
                  <span className="pstat__value pstat__value--savings">
                    <AnimatedNumber value={summary.balance} prefix="₹" />
                  </span>
                </div>
                <div className="pstat pstat--txn">
                  <span className="pstat__label">Transactions</span>
                  <span className="pstat__value">
                    <AnimatedNumber value={txnCount} />
                  </span>
                </div>
              </div>
            )}

            {/* DETAILS */}
            <div className="profile-details">
              <h3 className="profile-details__heading">Account Details</h3>
              <div className="profile-details__grid">
                <div className="pdetail">
                  <span className="pdetail__label">Full Name</span>
                  <span className="pdetail__value">{user.name}</span>
                </div>
                <div className="pdetail">
                  <span className="pdetail__label">Email Address</span>
                  <span className="pdetail__value">{user.email}</span>
                </div>
                <div className="pdetail">
                  <span className="pdetail__label">Member Since</span>
                  <span className="pdetail__value">
                    {user.createdAt ? formatDate(user.createdAt) : "—"}
                  </span>
                </div>
                <div className="pdetail">
                  <span className="pdetail__label">Savings Rate</span>
                  <span className="pdetail__value" style={{
                    color: savingsRate >= 30 ? "#00e5a0" : savingsRate >= 15 ? "#f59e0b" : "#ef4444"
                  }}>{savingsRate}%</span>
                </div>
                <div className="pdetail">
                  <span className="pdetail__label">Health Grade</span>
                  <span className="pdetail__value" style={{ color: "#00e5a0" }}>{grade}</span>
                </div>
                <div className="pdetail">
                  <span className="pdetail__label">Avg per Transaction</span>
                  <span className="pdetail__value">
                    ₹{txnCount > 0 && summary
                      ? Math.round(summary.totalExpense / txnCount).toLocaleString("en-IN")
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* HEALTH MESSAGE */}
            {health && (
              <div className="profile-tip">
                <span className="profile-tip__icon">💡</span>
                <p className="profile-tip__text">{health.message}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
