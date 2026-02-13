const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Alert = require("../models/Alert");
const mongoose = require("mongoose");

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

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    // 1️⃣ Savings Score
    let savingsScore = 0;
    if (totalIncome > 0) {
      const savingsRate = (balance / totalIncome) * 100;

      if (savingsRate > 30) savingsScore = 100;
      else if (savingsRate > 20) savingsScore = 80;
      else if (savingsRate > 10) savingsScore = 60;
      else savingsScore = 30;
    }

    // 2️⃣ Budget Score
    const alerts = await Alert.find({
      user: req.user,
      month
    });

    let budgetScore = 100;

    alerts.forEach(alert => {
      if (alert.type === "WARNING") budgetScore -= 15;
      if (alert.type === "EXCEEDED") budgetScore -= 30;
    });

    if (budgetScore < 0) budgetScore = 0;

    // 3️⃣ Stability Score (Anomaly-based)
    const anomalyData = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user),
          type: "expense",
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let stabilityScore = anomalyData.length > 0 ? 80 : 60;

    // Final Score (weighted)
    const finalScore = Math.round(
      savingsScore * 0.4 +
      budgetScore * 0.3 +
      stabilityScore * 0.3
    );

    let grade = "C";
    if (finalScore >= 85) grade = "A";
    else if (finalScore >= 70) grade = "B";
    else if (finalScore >= 50) grade = "C";
    else grade = "D";

    let message = "Financial performance needs improvement.";
    if (grade === "A") message = "Excellent financial discipline.";
    else if (grade === "B") message = "Good financial stability with minor improvements needed.";

    res.status(200).json({
      score: finalScore,
      grade,
      breakdown: {
        savingsScore,
        budgetScore,
        stabilityScore
      },
      message
    });

  } catch (error) {
    console.error("Health Score Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getHealthScore };
