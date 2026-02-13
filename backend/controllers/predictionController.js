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

    const today = new Date();
    const daysInMonth = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    ).getDate();

    const daysPassed =
      today.getMonth() === startDate.getMonth() &&
      today.getFullYear() === startDate.getFullYear()
        ? today.getDate()
        : daysInMonth;

    const transactions = await Transaction.find({
      user: req.user,
      type: "expense",
      date: { $gte: startDate, $lt: endDate }
    });

    const totalExpense = transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    if (daysPassed === 0) {
      return res.status(200).json({
        message: "No spending yet this month."
      });
    }

    const dailyAverage = totalExpense / daysPassed;
    const projectedExpense = dailyAverage * daysInMonth;

    let message = "Spending pace is normal.";

    if (projectedExpense > totalExpense * 1.2) {
      message = "At current pace, spending may increase significantly.";
    }

    res.status(200).json({
      currentExpense: totalExpense,
      daysPassed,
      daysInMonth,
      projectedExpense: projectedExpense.toFixed(2),
      message
    });

  } catch (error) {
    console.error("Prediction Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getPrediction };
