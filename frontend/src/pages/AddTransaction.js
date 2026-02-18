import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AddTransaction.css";

const EXPENSE_CATEGORIES = [
  "Food", "Rent", "Transport", "Entertainment", "Shopping",
  "Utilities", "Health", "Education", "Subscriptions", "Other"
];

const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Gift", "Refund", "Other"
];

function AddTransaction() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "type") {
      setForm((prev) => ({ ...prev, category: "" }));
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/transactions", {
        ...form,
        amount: parseFloat(form.amount),
      });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not add transaction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="add-transaction">
      <div className="add-transaction__content">
        <header className="add-transaction__header">
          <button
            type="button"
            className="add-transaction__back"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        <div className="add-transaction__card">
          <div className="add-transaction__header-inner">
            <h1 className="add-transaction__title">Add transaction</h1>
            <span className="add-transaction__icon">💳</span>
          </div>
          <p className="add-transaction__subtitle">
            Log your {form.type === "income" ? "income" : "expense"} to keep track
          </p>

          <form onSubmit={handleSubmit} className="add-transaction__form">
            {error && (
              <div className="add-transaction__error">{error}</div>
            )}

            <div className="add-transaction__type-toggle">
              <button
                type="button"
                className={`add-transaction__type-btn ${form.type === "expense" ? "add-transaction__type-btn--active" : ""}`}
                onClick={() => handleChange({ target: { name: "type", value: "expense" } })}
              >
                Expense
              </button>
              <button
                type="button"
                className={`add-transaction__type-btn ${form.type === "income" ? "add-transaction__type-btn--active" : ""}`}
                onClick={() => handleChange({ target: { name: "type", value: "income" } })}
              >
                Income
              </button>
            </div>

            <div className="add-transaction__field add-transaction__field--amount">
              <label htmlFor="amount" className="add-transaction__label">
                Amount
              </label>
              <div className="add-transaction__amount-wrap">
                <span className="add-transaction__currency">₹</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={form.amount}
                  onChange={handleChange}
                  className="add-transaction__input add-transaction__input--amount"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="add-transaction__field">
              <label htmlFor="category" className="add-transaction__label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="add-transaction__select"
                required
                disabled={loading}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="add-transaction__field">
              <label htmlFor="date" className="add-transaction__label">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="add-transaction__input"
                required
                disabled={loading}
              />
            </div>

            <div className="add-transaction__field">
              <label htmlFor="description" className="add-transaction__label">
                Description <span className="add-transaction__optional">(optional)</span>
              </label>
              <input
                id="description"
                name="description"
                type="text"
                placeholder="e.g. Grocery shopping"
                value={form.description}
                onChange={handleChange}
                className="add-transaction__input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="add-transaction__submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add transaction"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTransaction;
