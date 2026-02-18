const express = require("express");
const router = express.Router();

const { getHealthScore } = require("../controllers/healthController");
const { getPrediction } = require("../controllers/predictionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getHealthScore);
router.get("/prediction", protect, getPrediction);

module.exports = router;
