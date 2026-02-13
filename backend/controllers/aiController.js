const axios = require("axios");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Alert = require("../models/Alert");
const mongoose = require("mongoose");

const chatWithAI = async (req, res) => {
  try {
    const { question, month } = req.body;

    if (!question || !month) {
      return res.status(400).json({ message: "Question and month are required" });
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

    const budgets = await Budget.find({
      user: req.user,
      month
    });

    const alerts = await Alert.find({
      user: req.user,
      month
    });

    const context = `
User Financial Data for ${month}:

Total Income: ${totalIncome}
Total Expense: ${totalExpense}
Balance: ${balance}

Category Breakdown:
${categoryBreakdown.map(c => `${c._id}: ${c.total}`).join("\n")}

Budgets:
${budgets.map(b => `${b.category}: ${b.monthlyLimit}`).join("\n")}

Alerts:
${alerts.map(a => `${a.category} - ${a.type}`).join("\n")}
`;

    const prompt = `
You are a professional financial advisor.

${context}

User Question:
${question}

Answer clearly and give actionable advice.
`;

    // Call local Ollama API
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt: prompt,
      stream: false
    });

    res.status(200).json({
      answer: response.data.response
    });

  } catch (error) {
    console.error("Ollama Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { chatWithAI };
