const express = require("express");
const router = express.Router();

const { addTransaction, getTransactions, getSummary, getCategorySummary, deleteTransaction} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.get("/summary", protect, getSummary);
router.get("/category-summary", protect, getCategorySummary);
router.delete("/:id", protect, deleteTransaction);

module.exports = router;
