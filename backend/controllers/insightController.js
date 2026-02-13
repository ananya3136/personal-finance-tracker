const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getInsights = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Fetch transactions for that month
    const transactions = await Transaction.find({
      user: req.user,
      date: { $gte: startDate, $lt: endDate }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    // Category breakdown using aggregation
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

    // Prepare AI prompt
    const prompt = `
You are a professional financial advisor.

Here is the user's financial data for ${month}:

Total Income: ${totalIncome}
Total Expense: ${totalExpense}
Balance: ${balance}

Category Breakdown:
${categoryBreakdown.map(c => `${c._id}: ${c.total}`).join("\n")}

Give a short financial insight (3-4 sentences).
Be practical, actionable, and clear.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      
      messages: [
        { role: "system", content: "You are a helpful financial advisor." },
        { role: "user", content: prompt }
      ]
    });

    const summaryText = completion.choices[0].message.content;

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
      categoryBreakdown,
      insight: summaryText
    });

  } catch (error) {
    console.error("Insight Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getInsights };
