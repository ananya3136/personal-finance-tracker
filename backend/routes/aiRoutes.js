const express = require("express");
const router = express.Router();

const { chatWithAI, generateInsights } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, chatWithAI);
router.get("/insights", protect, generateInsights);

module.exports = router;
