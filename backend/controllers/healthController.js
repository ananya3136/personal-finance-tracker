const Transaction = require("../models/Transaction");

const getHealthScore = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const transactions = await Transaction.find({
      user: req.user,
      date: { $gte: startDate, $lt: endDate }
    });

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      if (t.type === "expense") expense += t.amount;
    });

    if (income === 0) {
      return res.json({
        score: 0,
        grade: "D",
        message: "No income recorded for this month."
      });
    }

    const savingsRate = ((income - expense) / income) * 100;

    let score = Math.round(savingsRate);

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    let grade = "D";

    if (score >= 80) grade = "A";
    else if (score >= 60) grade = "B";
    else if (score >= 40) grade = "C";

    let message = "";

    if (savingsRate >= 50) {
      message = "Excellent savings rate. You're managing money well.";
    } else if (savingsRate >= 20) {
      message = "Good savings rate. Try increasing savings slightly.";
    } else if (savingsRate > 0) {
      message = "Low savings rate. Consider reducing expenses.";
    } else {
      message = "You are spending more than you earn.";
    }

    res.json({
      score,
      grade,
      message,
      savingsRate: savingsRate.toFixed(1),
      income,
      expense
    });

  } catch (error) {
    console.error("Health error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getHealthScore };
