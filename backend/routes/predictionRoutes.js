const express = require("express");
const router = express.Router();

const { getPrediction } = require("../controllers/predictionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getPrediction);

module.exports = router;
