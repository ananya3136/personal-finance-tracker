const getHealthScore = async (req, res) => {
  try {
    console.log("Health endpoint hit");
    console.log("User ID:", req.user);

    res.status(200).json({
      score: 85,
      grade: "A",
      message: "Health endpoint working correctly."
    });

  } catch (error) {
    console.error("Health Controller Crash:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getHealthScore };
