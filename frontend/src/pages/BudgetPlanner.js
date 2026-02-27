import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BudgetPlanner.css";

const CATEGORIES = [
  "Food", "Rent", "Transport", "Entertainment",
  "Shopping", "Utilities", "Health", "Education",
  "Subscriptions", "Other"
];

const CATEGORY_ICONS = {
  Food: "🍔", Rent: "🏠", Transport: "🚗",
  Entertainment: "🎬", Shopping: "🛍️", Utilities: "💡",
  Health: "💊", Education: "📚", Subscriptions: "📱", Other: "📦"
};

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

function BudgetPlanner() {
  const navigate = useNavigate();

  const [month, setMonth] = useState(getCurrentMonth());
  const [category, setCategory] = useState("Food");
  const [limit, setLimit] = useState("");
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/");
  }, [navigate, token]);

  // Load budget status whenever month changes
  useEffect(() => {
    fetchBudgetStatus();
  }, [month]);

  const fetchBudgetStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets/status?month=${month}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBudgetStatus(data);
      }
    } catch (err) {
      console.error("Budget status error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!limit || parseFloat(limit) <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers,
        body: JSON.stringify({
          category,
          monthlyLimit: parseFloat(limit),
          month,
        }),
      });

      if (res.ok) {
        setSuccess(`✅ Budget set for ${category} — ₹${parseFloat(limit).toLocaleString("en-IN")}/month`);
        setLimit("");
        fetchBudgetStatus();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to set budget.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="budget-page">
      <div className="budget-page__content">

        {/* Header */}
        <div className="budget-page__header">
          <div className="budget-page__header-left">
            <button
              className="budget-page__back"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>
            <h1 className="budget-page__title">Budget Planner</h1>
          </div>

          <input
            type="month"
            className="budget-month-pick"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {/* Set Budget Form */}
        <div className="budget-form-card">
          <h2>Set a Budget Limit</h2>
          <form className="budget-form" onSubmit={handleSetBudget}>
            <div className="budget-form__field">
              <label className="budget-form__label">Category</label>
              <select
                className="budget-form__select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="budget-form__field">
              <label className="budget-form__label">Monthly Limit (₹)</label>
              <input
                type="number"
                className="budget-form__input"
                placeholder="e.g. 5000"
                min="1"
                step="1"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="budget-form__submit"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Set Budget"}
            </button>
          </form>

          {success && <div className="budget-form__success">{success}</div>}
          {error && <div className="budget-form__error">{error}</div>}
        </div>

        {/* Budget Status */}
        <div className="budget-status-section">
          <h2>Budget Status for {month}</h2>

          {loading && (
            <div className="budget-loading">Loading budget data...</div>
          )}

          {!loading && budgetStatus.length === 0 && (
            <div className="budget-empty">
              <div className="budget-empty__icon">🎯</div>
              <p>No budgets set for {month} yet.<br />
              Use the form above to set your first budget limit.</p>
            </div>
          )}

          {!loading && budgetStatus.length > 0 && (
            <div className="budget-status-grid">
              {budgetStatus.map((b, i) => {
                const pct = Math.min(parseFloat(b.percentage), 100);
                const remaining = b.monthlyLimit - b.totalSpent;

                return (
                  <div
                    key={i}
                    className={`budget-status-card ${
                      b.status !== "SAFE" ? `budget-status-card--${b.status.toLowerCase()}` : ""
                    }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="budget-status-card__top">
                      <div className="budget-status-card__left">
                        <div className={`budget-status-card__icon cat-icon-${b.category}`}>
                          {CATEGORY_ICONS[b.category] || "📦"}
                        </div>
                        <div>
                          <div className="budget-status-card__category">
                            {b.category}
                          </div>
                          <div className="budget-status-card__amounts">
                            ₹{b.totalSpent.toLocaleString("en-IN")} / ₹{b.monthlyLimit.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      <span className={`budget-status-badge budget-status-badge--${b.status}`}>
                        {b.status === "SAFE" && "✓ On Track"}
                        {b.status === "WARNING" && "⚠ Warning"}
                        {b.status === "EXCEEDED" && "🚨 Exceeded"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="budget-progress">
                      <div
                        className={`budget-progress__fill budget-progress__fill--${b.status}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="budget-progress__meta">
                      <span>{b.percentage}% used</span>
                      <span>
                        {remaining >= 0
                          ? `₹${remaining.toLocaleString("en-IN")} remaining`
                          : `₹${Math.abs(remaining).toLocaleString("en-IN")} over budget`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BudgetPlanner;
