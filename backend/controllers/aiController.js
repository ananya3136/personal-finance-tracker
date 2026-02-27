const Transaction = require("../models/Transaction");
const axios = require("axios");

/* ==============================
   AI CHAT
============================== */
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user;

    const transactions = await Transaction.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const savings = totalIncome - totalExpense;

    const prompt = `
You are a financial advisor AI.

User Financial Summary:
Income: ₹${totalIncome}
Expense: ₹${totalExpense}
Savings: ₹${savings}

User Question:
${message}

Respond clearly and professionally.
`;

    const llamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt,
        stream: false,
      }
    );

    res.json({ reply: llamaResponse.data.response });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: "AI error" });
  }
};

/* ==============================
   AI INSIGHTS
============================== */
const generateInsights = async (req, res) => {
  try {
    const userId = req.user;

    const transactions = await Transaction.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const savings = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0
        ? ((savings / totalIncome) * 100).toFixed(1)
        : 0;

    const prompt = `
You are a professional financial advisor.

Analyze this financial data:

Income: ₹${totalIncome}
Expense: ₹${totalExpense}
Savings: ₹${savings}
Savings Rate: ${savingsRate}%

Provide:
1. Risk Level (Low / Medium / High)
2. One key insight
3. One actionable suggestion

Keep response structured and concise.
`;

    const llamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt,
        stream: false,
      }
    );

    res.json({
      insight: llamaResponse.data.response,
    });

  } catch (error) {
    console.error("AI Insight Error:", error);
    res.status(500).json({ message: "AI insight error" });
  }
};

/* ==============================
   EXPORTS
============================== */
module.exports = {
  chatWithAI,
  generateInsights,
};