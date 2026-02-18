const getAlerts = async (req, res) => {
  res.status(200).json([
    {
      type: "WARNING",
      message: "You have used 75% of your Food budget."
    },
    {
      type: "EXCEEDED",
      message: "Your Entertainment budget has been exceeded."
    }
  ]);
};

module.exports = { getAlerts };
