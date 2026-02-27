import React, { useState, useRef, useEffect } from "react";
import "./ExportButton.css";

/* ─────────────────────────────────────────
   CSV EXPORT
───────────────────────────────────────── */
function exportCSV(transactions) {
  const headers = ["Date", "Type", "Category", "Amount (₹)", "Description"];

  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString("en-IN"),
    t.type.charAt(0).toUpperCase() + t.type.slice(1),
    t.category,
    t.amount,
    t.description || "-",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────
   PDF EXPORT  (no external library needed)
───────────────────────────────────────── */
function exportPDF(transactions) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const savings = totalIncome - totalExpense;

  const rows = transactions
    .map(
      (t) => `
      <tr>
        <td>${new Date(t.date).toLocaleDateString("en-IN")}</td>
        <td>
          <span class="badge badge--${t.type}">
            ${t.type.charAt(0).toUpperCase() + t.type.slice(1)}
          </span>
        </td>
        <td>${t.category}</td>
        <td class="amount amount--${t.type}">
          ${t.type === "income" ? "+" : "-"}₹${t.amount.toLocaleString("en-IN")}
        </td>
        <td>${t.description || "—"}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Transaction Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Sora', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 40px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e2e8f0;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
    }

    .header p {
      color: #64748b;
      font-size: 13px;
      margin-top: 4px;
    }

    .logo {
      background: linear-gradient(135deg, #00e5a0, #00c97d);
      color: #0f172a;
      font-weight: 700;
      font-size: 13px;
      padding: 8px 14px;
      border-radius: 8px;
    }

    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 32px;
    }

    .summary-card {
      flex: 1;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .summary-card--income { background: #f0fdf4; border-color: #bbf7d0; }
    .summary-card--expense { background: #fff1f2; border-color: #fecdd3; }
    .summary-card--savings { background: #fffbeb; border-color: #fde68a; }

    .summary-card .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 8px;
    }

    .summary-card .value {
      font-size: 22px;
      font-weight: 700;
    }

    .summary-card--income .value { color: #16a34a; }
    .summary-card--expense .value { color: #dc2626; }
    .summary-card--savings .value { color: #d97706; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead tr {
      background: #f1f5f9;
    }

    th {
      padding: 12px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }

    td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    tr:hover td { background: #f8fafc; }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    .badge--income { background: #dcfce7; color: #16a34a; }
    .badge--expense { background: #fee2e2; color: #dc2626; }

    .amount { font-weight: 600; }
    .amount--income { color: #16a34a; }
    .amount--expense { color: #dc2626; }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Transaction Report</h1>
      <p>Generated on ${new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
    </div>
    <div class="logo">💰 FinanceTracker</div>
  </div>

  <div class="summary">
    <div class="summary-card summary-card--income">
      <div class="label">Total Income</div>
      <div class="value">₹${totalIncome.toLocaleString("en-IN")}</div>
    </div>
    <div class="summary-card summary-card--expense">
      <div class="label">Total Expense</div>
      <div class="value">₹${totalExpense.toLocaleString("en-IN")}</div>
    </div>
    <div class="summary-card summary-card--savings">
      <div class="label">Net Savings</div>
      <div class="value">₹${savings.toLocaleString("en-IN")}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Category</th>
        <th>Amount</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    <span>Personal Finance Tracker — Confidential</span>
    <span>Total ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}</span>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
function ExportButton({ transactions = [] }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (msg, icon) => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCSV = () => {
    setOpen(false);
    if (!transactions.length) {
      showToast("No transactions to export", "⚠️");
      return;
    }
    exportCSV(transactions);
    showToast("CSV downloaded successfully!", "✅");
  };

  const handlePDF = () => {
    setOpen(false);
    if (!transactions.length) {
      showToast("No transactions to export", "⚠️");
      return;
    }
    exportPDF(transactions);
    showToast("PDF report opened for printing", "✅");
  };

  return (
    <>
      <div className="export-wrapper" ref={wrapperRef}>
        <button
          className="export-btn"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="export-btn__icon">⬇</span>
          Export
        </button>

        {open && (
          <div className="export-dropdown">
            <div className="export-dropdown__label">Download as</div>

            <button className="export-dropdown__item export-dropdown__item--csv" onClick={handleCSV}>
              <div className="export-dropdown__item-icon">📊</div>
              <div className="export-dropdown__item-info">
                <div className="export-dropdown__item-title">CSV Spreadsheet</div>
                <div className="export-dropdown__item-sub">Open in Excel / Sheets</div>
              </div>
            </button>

            <div className="export-dropdown__divider" />

            <button className="export-dropdown__item export-dropdown__item--pdf" onClick={handlePDF}>
              <div className="export-dropdown__item-icon">📄</div>
              <div className="export-dropdown__item-info">
                <div className="export-dropdown__item-title">PDF Report</div>
                <div className="export-dropdown__item-sub">Print or save as PDF</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="export-toast">
          <span className="export-toast__icon">{toast.icon}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}

export default ExportButton;
