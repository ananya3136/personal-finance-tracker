const express = require("express");
const router = express.Router();

const { getStrategy } = require("../controllers/strategyController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getStrategy);

module.exports = router;
