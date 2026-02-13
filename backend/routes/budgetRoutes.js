const express = require("express");
const router = express.Router();

const { setBudget, getBudgetStatus } = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, setBudget);
router.get("/status", protect, getBudgetStatus);

module.exports = router;
