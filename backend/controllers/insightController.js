const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const axios = require("axios");

const getInsights = async (req, res) => {
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

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    const categoryBreakdown = await Transaction.aggregate([
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

    const prompt = `
You are a professional financial advisor.

Here is the user's financial data for ${month}:

Total Income: ₹${totalIncome}
Total Expense: ₹${totalExpense}
Balance: ₹${balance}

Category Breakdown:
${categoryBreakdown.map(c => `${c._id}: ₹${c.total}`).join("\n")}

Give a short financial insight (3-4 sentences).
Be practical, actionable, and clear.
`;

    const llamaResponse = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt,
      stream: false
    });

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
      categoryBreakdown,
      insight: llamaResponse.data.response
    });

  } catch (error) {
    console.error("Insight Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getInsights };