const Transaction = require("../models/Transaction");

const getPrediction = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 🔥 FILTER BY USER + MONTH
    const transactions = await Transaction.find({
      user: req.user,
      date: { $gte: startDate, $lt: endDate }
    });

    let currentExpense = 0;

    transactions.forEach(t => {
      if (t.type === "expense") {
        currentExpense += t.amount;
      }
    });

    const today = new Date();
    const currentMonth = today.getMonth();
    const selectedMonth = startDate.getMonth();

    let daysPassed = 1;

    if (currentMonth === selectedMonth) {
      daysPassed = today.getDate();
    } else {
      daysPassed = 30; // full month assumption
    }

    const daysInMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    ).getDate();

    const dailyAverage = currentExpense / daysPassed;

    const projectedExpense = dailyAverage * daysInMonth;

    let paceStatus = "on_track";

    if (dailyAverage * daysInMonth > currentExpense * 1.3) {
      paceStatus = "watch";
    }

    let message = "";

    if (projectedExpense > currentExpense * 1.5) {
      message = "Spending trend increasing fast. Reduce discretionary expenses.";
    } else if (projectedExpense > currentExpense) {
      message = "Spending pace is moderate. Monitor daily expenses.";
    } else {
      message = "Spending pace is stable. You're on track.";
    }

    res.json({
      currentExpense,
      projectedExpense: projectedExpense.toFixed(0),
      dailyAverage: dailyAverage.toFixed(0),
      daysPassed,
      daysInMonth,
      daysRemaining: daysInMonth - daysPassed,
      paceStatus,
      message
    });

  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPrediction };
