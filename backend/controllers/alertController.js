const Alert = require("../models/Alert");

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user })
      .sort({ createdAt: -1 });

    res.status(200).json(alerts);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAlerts };
