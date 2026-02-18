const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

// Add Transaction
const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const transaction = await Transaction.create({
      user: req.user,
      amount,
      type,
      category,
      description,
      date: date ? new Date(date) : Date.now()
    });

    res.status(201).json(transaction);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// Get Transactions
const getTransactions = async (req, res) => {
  try {
    const { month } = req.query;

    let filter = { user: req.user };

    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user });

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

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getCategorySummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $match: {
  user: new mongoose.Types.ObjectId(req.user),
  type: "expense"
}
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1
        }
      }
    ]);

    res.status(200).json(summary);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await transaction.deleteOne();

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { addTransaction, getTransactions, getSummary, getCategorySummary, deleteTransaction };