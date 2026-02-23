const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

const getSmartRecommendation = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const userId = req.user._id;

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lt: endDate }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let categoryMap = {};
transactions.forEach((t) => {
  if (t.type.toLowerCase() === "income") {
    totalIncome += t.amount;
  }

  if (t.type.toLowerCase() === "expense") {
    totalExpense += t.amount;

    if (t.category) {
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + t.amount;
    }
  }
});

   

    const savings = totalIncome - totalExpense;

    const savingsRate =
      totalIncome > 0
        ? ((savings / totalIncome) * 100).toFixed(1)
        : 0;

   let topExpenseCategory = "No expense data";

if (Object.keys(categoryMap).length > 0) {
  const sorted = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1]);

  topExpenseCategory = sorted[0][0];
}


    let advice = "";

    if (savings < 0) {
      advice =
        "You are spending more than you earn. Immediate cost control required.";
    } else if (savingsRate < 20) {
      advice =
        "Your savings rate is low. Consider reducing discretionary expenses.";
    } else if (savingsRate < 40) {
      advice =
        "Good savings rate. Try automating investments to grow wealth.";
    } else {
      advice =
        "Excellent savings rate. Consider investing surplus into SIPs or mutual funds.";
    }

    res.json({
      totalIncome,
      totalExpense,
      savings,
      savingsRate,
      topExpenseCategory,
      advice
    });

  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSmartRecommendation };
