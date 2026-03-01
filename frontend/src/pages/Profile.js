import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const CURRENT_MONTH = "2026-02";

function MiniRing({ score }) {
  const ringRef = useRef(null);
  const circumference = 2 * Math.PI * 32; // r=32
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (ringRef.current) {
      setTimeout(() => {
        ringRef.current.style.strokeDashoffset = offset;
      }, 300);
    }
  }, [offset]);

  return (
    <div className="profile-health-score__ring">
      <svg viewBox="0 0 72 72" width="72" height="72">
        <circle className="ring-bg" cx="36" cy="36" r="32" />
        <circle
          ref={ringRef}
          className="ring-fill"
          cx="36" cy="36" r="32"
          style={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
        />
      </svg>
      <div className="profile-health-score__inner">
        <div className="profile-health-score__num">{score}</div>
        <div className="profile-health-score__grade">
          {score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D"}
        </div>
      </div>
    </div>
  );
}

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

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const [txnCount, setTxnCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
const loadProfile = async () => {
  try {
    setLoading(true);

    const [summaryRes, healthRes, txnRes, userRes] = await Promise.all([
      fetch("/api/transactions/summary", { headers }),
      fetch(`/api/health-score?month=${CURRENT_MONTH}`, { headers }),
      fetch("/api/transactions", { headers }),
      fetch("/api/users/me", { headers }),
    ]);

    if (summaryRes.ok) setSummary(await summaryRes.json());
    if (healthRes.ok)  setHealth(await healthRes.json());
    if (txnRes.ok) {
      const txns = await txnRes.json();
      setTxnCount(txns.length);
    }
    if (userRes.ok) {
      const userData = await userRes.json();
      setUser({
        name:      userData.name,
        email:     userData.email,
        createdAt: userData.createdAt,
      });
    }

  } catch (err) {
    console.error("Profile load error:", err);
    setError("Failed to load profile data.");
  } finally {
    setLoading(false);
  }
};

    loadProfile();
  }, [navigate]);

  const savingsRate = summary && summary.totalIncome > 0
    ? (((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100).toFixed(1)
    : 0;

  return (
    <div className="profile-page">
      <div className="profile-page__content">

        {/* Header */}
        <div className="profile-header-row">
          <button className="profile-back" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </div>

        {loading && <div className="profile-loading">Loading your profile...</div>}
        {error   && <div className="profile-error">{error}</div>}

        {!loading && user && (
          <>
            {/* Hero Card */}
            <div className="profile-hero">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar-ring">
                  <div className="profile-avatar">
                    {getInitials(user.name)}
                  </div>
                </div>
                <div className="profile-avatar-badge">✓</div>
              </div>

              <div className="profile-hero__info">
                <h1 className="profile-hero__name">{user.name}</h1>
                <p className="profile-hero__email">{user.email}</p>
                <div className="profile-hero__tags">
                  <span className="profile-tag profile-tag--member">
                    ⭐ Premium Member
                  </span>
                  {user.createdAt && (
                    <span className="profile-tag profile-tag--joined">
                      📅 Since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {summary && (
              <div className="profile-stats">
                <div className="profile-stat-card profile-stat-card--income" style={{ animationDelay: "0.05s" }}>
                  <span className="profile-stat-card__icon">💰</span>
                  <div className="profile-stat-card__label">Total Income</div>
                  <div className="profile-stat-card__value profile-stat-card__value--income">
                    ₹{summary.totalIncome.toLocaleString("en-IN")}
                  </div>
                  <div className="profile-stat-card__sub">All time</div>
                </div>

                <div className="profile-stat-card profile-stat-card--expense" style={{ animationDelay: "0.1s" }}>
                  <span className="profile-stat-card__icon">💸</span>
                  <div className="profile-stat-card__label">Total Spent</div>
                  <div className="profile-stat-card__value profile-stat-card__value--expense">
                    ₹{summary.totalExpense.toLocaleString("en-IN")}
                  </div>
                  <div className="profile-stat-card__sub">All time</div>
                </div>

                <div className="profile-stat-card profile-stat-card--savings" style={{ animationDelay: "0.15s" }}>
                  <span className="profile-stat-card__icon">🏦</span>
                  <div className="profile-stat-card__label">Net Savings</div>
                  <div className="profile-stat-card__value profile-stat-card__value--savings">
                    ₹{summary.balance.toLocaleString("en-IN")}
                  </div>
                  <div className="profile-stat-card__sub">{savingsRate}% savings rate</div>
                </div>

                <div className="profile-stat-card profile-stat-card--txn" style={{ animationDelay: "0.2s" }}>
                  <span className="profile-stat-card__icon">📋</span>
                  <div className="profile-stat-card__label">Transactions</div>
                  <div className="profile-stat-card__value">{txnCount}</div>
                  <div className="profile-stat-card__sub">Total logged</div>
                </div>

                <div className="profile-stat-card profile-stat-card--health" style={{ animationDelay: "0.25s" }}>
                  <span className="profile-stat-card__icon">❤️</span>
                  <div className="profile-stat-card__label">Health Score</div>
                  <div className="profile-stat-card__value">
                    {health ? `${health.score}/100` : "—"}
                  </div>
                  <div className="profile-stat-card__sub">
                    {health ? `Grade ${health.score >= 80 ? "A" : health.score >= 60 ? "B" : health.score >= 40 ? "C" : "D"}` : "This month"}
                  </div>
                </div>

                <div className="profile-stat-card profile-stat-card--streak" style={{ animationDelay: "0.3s" }}>
                  <span className="profile-stat-card__icon">🔥</span>
                  <div className="profile-stat-card__label">Avg Transaction</div>
                  <div className="profile-stat-card__value">
                    ₹{txnCount > 0 ? Math.round(summary.totalExpense / txnCount).toLocaleString("en-IN") : 0}
                  </div>
                  <div className="profile-stat-card__sub">Per expense</div>
                </div>
              </div>
            )}

            {/* Financial Health Band */}
            {health && (
              <div className="profile-health-band">
                <div className="profile-health-band__left">
                  <h3>Financial Health Score</h3>
                  <p>{health.message}</p>
                </div>
                <div className="profile-health-score">
                  <MiniRing score={health.score} />
                </div>
              </div>
            )}

            {/* Account Details */}
            <div className="profile-details-card">
              <div className="profile-details-card__header">Account Details</div>
              <div className="profile-details-list">
                <div className="profile-detail-row">
                  <div className="profile-detail-row__left">
                    <div className="profile-detail-row__icon">👤</div>
                    <span className="profile-detail-row__label">Full Name</span>
                  </div>
                  <span className="profile-detail-row__value">{user.name}</span>
                </div>

                <div className="profile-detail-row">
                  <div className="profile-detail-row__left">
                    <div className="profile-detail-row__icon">📧</div>
                    <span className="profile-detail-row__label">Email Address</span>
                  </div>
                  <span className="profile-detail-row__value">{user.email}</span>
                </div>

                <div className="profile-detail-row">
                  <div className="profile-detail-row__left">
                    <div className="profile-detail-row__icon">🗓️</div>
                    <span className="profile-detail-row__label">Member Since</span>
                  </div>
                  <span className="profile-detail-row__value">
                    {user.createdAt ? formatDate(user.createdAt) : "—"}
                  </span>
                </div>

                <div className="profile-detail-row">
                  <div className="profile-detail-row__left">
                    <div className="profile-detail-row__icon">🔐</div>
                    <span className="profile-detail-row__label">Account Status</span>
                  </div>
                  <span className="profile-detail-row__value" style={{ color: "#00e5a0" }}>
                    ✓ Active
                  </span>
                </div>

                <div className="profile-detail-row">
                  <div className="profile-detail-row__left">
                    <div className="profile-detail-row__icon">💹</div>
                    <span className="profile-detail-row__label">Savings Rate</span>
                  </div>
                  <span className="profile-detail-row__value" style={{
                    color: savingsRate >= 30 ? "#00e5a0" : savingsRate >= 15 ? "#f59e0b" : "#ef4444"
                  }}>
                    {savingsRate}%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
