const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
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
    month: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["WARNING", "EXCEEDED"],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
