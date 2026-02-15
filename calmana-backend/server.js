// calmana-backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");

const accountRoutes = require("./routes/account");
const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quizRoutes");   
const journalRoutes = require("./routes/journal");
const breathingRoutes = require("./routes/breathingRoutes");
const affirmationRoutes = require("./routes/affirmationRoutes");
const moodRoutes = require("./routes/moodRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const dashboardDayRoutes = require("./routes/dashboardDayRoutes");
const adminAuth = require("./routes/adminAuth");
const adminDataRoutes = require("./routes/adminDataRoutes");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS === "*"
      ? true
      : process.env.ALLOWED_ORIGINS.split(","),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.options("*", cors());

// Public Auth Routes
app.use("/api/auth", authRoutes);

// Protected Account Routes
app.use("/api/account", accountRoutes);

// ⭐ QUIZ ROUTES 
app.use("/api/quiz", quizRoutes);   

// ⭐ JOURNAL ROUTES
app.use("/api/journal", journalRoutes);

// ⭐ BREATHING ROUTES
app.use("/breathing", breathingRoutes);

// ⭐ AFFIRMATIONS ROUTES
app.use("/api/affirmations", affirmationRoutes);

// ⭐ MOOD ROUTES
app.use("/mood", moodRoutes);

// ⭐ DASHBOARD
app.use("/dashboard", dashboardRoutes);
app.use("/dashboard", dashboardDayRoutes);

app.use("/api/admin", adminAuth);
app.use("/api/admin-data", adminDataRoutes); 

// Test
app.get("/api/ping", (req, res) => {
  res.json({ message: "Backend is working!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

console.log("Loaded key length:", process.env.ENCRYPTION_KEY?.length);

