
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());


const transactionRoutes = require("./routes/transactionRoutes");
const alertRoutes = require("./routes/alertRoutes");
const insightRoutes = require("./routes/insightRoutes");
const aiRoutes = require("./routes/aiRoutes");
const anomalyRoutes = require("./routes/anomalyRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const healthRoutes = require("./routes/healthRoutes");
const strategyRoutes = require("./routes/strategyRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

console.log("Analysis routes loaded:");
require("./models/User");
require("./models/Transaction");
require("./models/Budget");
require("./models/Alert");

//middleware to read JSON from requests
const userRoutes = require("./routes/userRoutes");
app.use("/api/transactions", transactionRoutes);
const budgetRoutes = require("./routes/budgetRoutes");
app.use("/api/budgets", budgetRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/anomalies", anomalyRoutes);
app.use("/api/predict", predictionRoutes);
app.use("/api/health-score", healthRoutes);
app.use("/api/strategy", strategyRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics", analyticsRoutes);


//connect mongodb
const mongoose = require("mongoose");

mongoose
.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));
app.use("/api/users", userRoutes);

//test route
app.get("/", (req, res) =>{
    res.send("Personal Finance Tracker API is running");
});

//start the server 
const PORT=  5000;
app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
});