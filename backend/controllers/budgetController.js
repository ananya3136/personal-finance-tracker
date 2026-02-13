const Alert = require("../models/Alert");
const Budget = require("../models/Budget");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

// 1️⃣ SET BUDGET
const setBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month } = req.body;

    if (!category || !monthlyLimit || !month) {
      return res.status(400).json({ message: "All fields required" });
    }

    let budget = await Budget.findOne({
      user: req.user,
      category,
      month
    });

    if (budget) {
      budget.monthlyLimit = monthlyLimit;
      await budget.save();
    } else {
      budget = await Budget.create({
        user: req.user,
        category,
        monthlyLimit,
        month
      });
    }

    res.status(200).json({
      message: "Budget set successfully",
      budget
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// 2️⃣ GET BUDGET STATUS (ADD THIS BELOW setBudget)
const getBudgetStatus = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const budgets = await Budget.find({
      user: req.user,
      month
    });

    const results = [];

    for (let budget of budgets) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const spent = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(req.user),
            category: budget.category,
            type: "expense",
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);

      const totalSpent = spent.length > 0 ? spent[0].total : 0;

      const percentage = (totalSpent / budget.monthlyLimit) * 100;

      let status = "SAFE";
      if (percentage >= 90) {
        status = "EXCEEDED";
      } else if (percentage >= 70) {
        status = "WARNING";
      }
      if (status !== "SAFE") {
  const existingAlert = await Alert.findOne({
    user: req.user,
    category: budget.category,
    month,
    type: status
  });

  if (!existingAlert) {
    await Alert.create({
      user: req.user,
      category: budget.category,
      month,
      type: status,
      message: `Your ${budget.category} spending is ${percentage.toFixed(2)}% of your budget.`
    });
  }
}


      results.push({
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        totalSpent,
        percentage: percentage.toFixed(2),
        status
      });
    }

    res.status(200).json(results);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { setBudget, getBudgetStatus };

