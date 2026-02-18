console.log("SERVER FILE LOADED");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
// Parse JSON
app.use(express.json());

// Routes
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const alertRoutes = require("./routes/alertRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

app.use("/api/users", userRoutes);
app.use("/api/health-score", healthRoutes);
app.use("/api/predict", predictionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/transactions", transactionRoutes);
console.log("Prediction route mounted");

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
  app.get("/api/predict", (req, res) => {
    res.json({ test: "Predict route working" });
  });
  
// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
