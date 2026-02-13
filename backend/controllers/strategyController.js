const axios = require("axios");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Alert = require("../models/Alert");
const mongoose = require("mongoose");

const getStrategy = async (req, res) => {
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

    const alerts = await Alert.find({
      user: req.user,
      month
    });

    const context = `
Financial Summary for ${month}

Income: ${totalIncome}
Expenses: ${totalExpense}
Balance: ${balance}

Category Breakdown:
${categoryBreakdown.map(c => `${c._id}: ${c.total}`).join("\n")}

Active Alerts:
${alerts.map(a => `${a.category} - ${a.type}`).join("\n")}
`;

    const prompt = `
You are a professional financial strategist.

Based on the following financial data:

${context}

Create a clear 3-5 step actionable financial improvement strategy.
Make it practical and structured.
`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt: prompt,
      stream: false
    });

    res.status(200).json({
      strategy: response.data.response
    });

  } catch (error) {
    console.error("Strategy Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getStrategy };
