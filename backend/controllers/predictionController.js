const getPrediction = async (req, res) => {
  try {
    const currentExpense = 2000;
    const daysPassed = 14;
    const daysInMonth = 28;
    const projectedExpense = 4000;
    const dailyAverage = currentExpense / daysPassed;
    const daysRemaining = daysInMonth - daysPassed;
    const projectedRemaining = dailyAverage * daysRemaining;

    // Pace analysis: compare spend-to-date vs expected proportional spend
    const timeElapsed = daysPassed / daysInMonth;
    const expectedSpendSoFar = projectedExpense * timeElapsed;
    const paceRatio = currentExpense / (expectedSpendSoFar || 1);

    let paceStatus = "on_track";
    let message = "Spending pace is normal. You're on track for the month.";
    let tip = "Keep tracking to maintain healthy spending habits.";

    if (paceRatio > 1.15) {
      paceStatus = "over";
      message = "At current pace, spending may increase significantly by month-end.";
      tip = `Try reducing daily spend by ~${Math.round((1 - 1 / paceRatio) * 100)}% to stay on track.`;
    } else if (paceRatio < 0.85) {
      paceStatus = "ahead";
      message = "Great job! You're spending less than projected.";
      tip = "Consider moving the savings to an emergency fund or investment.";
    } else if (paceRatio > 1.05) {
      paceStatus = "watch";
      message = "Spending is slightly above pace. Small adjustments can help.";
      tip = "Review recurring subscriptions or discretionary spend this week.";
    }

    res.status(200).json({
      currentExpense,
      daysPassed,
      daysInMonth,
      projectedExpense: projectedExpense.toFixed(2),
      dailyAverage: dailyAverage.toFixed(0),
      daysRemaining,
      projectedRemaining: projectedRemaining.toFixed(0),
      paceStatus,
      message,
      tip,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPrediction };
