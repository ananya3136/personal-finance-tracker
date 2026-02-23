const express = require("express");
const router = express.Router();

const { getSmartRecommendation } = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getSmartRecommendation);

module.exports = router;
