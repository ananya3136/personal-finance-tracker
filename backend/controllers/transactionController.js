const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");


// ===============================
// ADD TRANSACTION
// ===============================
const addTransaction = async (req, res) => {
  try {
    const { amount, category, type, date, description } = req.body;

    const transaction = await Transaction.create({
      amount,
      category,
      type,
      date,
      description,
      user: req.user._id,   // 🔥 Always use _id
    });

    res.status(201).json(transaction);

  } catch (error) {
    res.status(500).json({
      message: "Failed to add transaction",
      error: error.message
    });
  }
};


// ===============================
// GET TRANSACTIONS (FILTERED BY USER)
// ===============================
const getTransactions = async (req, res) => {
  try {
    const { month } = req.query;

    let filter = { user: req.user._id };

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
      .sort({ date: -1 });

    res.status(200).json(transactions);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// ===============================
// GET INCOME / EXPENSE SUMMARY
// ===============================
const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id
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

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// ===============================
// CATEGORY SUMMARY (EXPENSE ONLY)
// ===============================
const getCategorySummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
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
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// ===============================
// DELETE TRANSACTION
// ===============================
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id   // 🔥 Correct user filter
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      message: "Transaction deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// ===============================
// EXPORTS
// ===============================
module.exports = {
  addTransaction,
  getTransactions,
  getSummary,
  getCategorySummary,
  deleteTransaction
};
