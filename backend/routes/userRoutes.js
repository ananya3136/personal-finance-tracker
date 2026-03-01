const express = require("express");
const router = express.Router();

const { signupUser, loginUser, getMe } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

module.exports = router;