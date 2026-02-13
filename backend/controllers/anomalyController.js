const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

const getAnomalies = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    const currentStart = new Date(`${month}-01`);
    const currentEnd = new Date(currentStart);
    currentEnd.setMonth(currentEnd.getMonth() + 1);

    const previousStart = new Date(currentStart);
    previousStart.setMonth(previousStart.getMonth() - 1);

    const previousEnd = new Date(currentStart);

    // Current month expenses
    const currentData = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user),
          type: "expense",
          date: { $gte: currentStart, $lt: currentEnd }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Previous month expenses
    const previousData = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user),
          type: "expense",
          date: { $gte: previousStart, $lt: previousEnd }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const anomalies = [];

    currentData.forEach(current => {
      const prev = previousData.find(p => p._id === current._id);

      if (prev) {
        const changePercent =
          ((current.total - prev.total) / prev.total) * 100;

        if (changePercent > 30) {
          anomalies.push({
            type: "SPIKE",
            category: current._id,
            message: `${current._id} spending increased by ${changePercent.toFixed(1)}% compared to last month.`
          });
        }

        if (changePercent < -30) {
          anomalies.push({
            type: "DROP",
            category: current._id,
            message: `${current._id} spending decreased significantly compared to last month.`
          });
        }
      }
    });

    res.status(200).json(anomalies);

  } catch (error) {
    console.error("Anomaly Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAnomalies };
