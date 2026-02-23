const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

const getAlerts = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const budgets = await Budget.find({
      user: req.user,
      month
    });

    const transactions = await Transaction.find({
      user: req.user,
      type: "expense",
      date: { $gte: startDate, $lt: endDate }
    });

    const alerts = [];

    for (let budget of budgets) {
      const spent = transactions
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const usagePercentage = (spent / budget.amount) * 100;

      if (usagePercentage >= 100) {
        alerts.push({
          type: "EXCEEDED",
          message: `Your ${budget.category} budget has been exceeded.`
        });
      } else if (usagePercentage >= 75) {
        alerts.push({
          type: "WARNING",
          message: `You have used ${Math.round(usagePercentage)}% of your ${budget.category} budget.`
        });
      }
    }

    res.json(alerts);

  } catch (error) {
    console.error("Alert error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAlerts };
