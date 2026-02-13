const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: String,
      required: true
    },
    monthlyLimit: {
      type: Number,
      required: true
    },
    month: {
      type: String, // format: "2026-02"
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
