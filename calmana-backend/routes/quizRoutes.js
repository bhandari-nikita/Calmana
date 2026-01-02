// calmana-backend/routes/quizRoutes.js
const express = require("express");
const connectDB = require("../db");
const QuizResult = require("../models/QuizResult");
const { protect } = require("../middleware/auth");

const router = express.Router();

// SAVE QUIZ RESULT — with 24-hour cooldown
router.post("/save", protect, async (req, res) => {
  try {
    await connectDB();

    const istDateKey = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });


    const { quizSlug, quizTitle, answers, score, maxScore, percentage, level } = req.body;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const lastAttempt = await QuizResult.findOne({
      userId: req.user._id,
      quizSlug: quizSlug,
      takenAt: { $gte: twentyFourHoursAgo }
    });

    if (lastAttempt) {
      return res.status(400).json({ error: "COOLDOWN" });
    }

    const result = await QuizResult.create({
      userId: req.user._id,
      quizSlug,
      quizTitle,
      answers,
      score,
      maxScore,
      percentage,
      level,

      dateKey: istDateKey, // ⭐ ADD
      takenAt: new Date()
    });

    return res.status(201).json({ success: true, result });

  } catch (err) {
    console.error("Quiz Save Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET QUIZ RESULTS FOR A MONTH
router.get("/month", protect, async (req, res) => {
  try {
    await connectDB();

    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: "Missing year or month" });
    }

    const y = String(year);
    const m = String(month).padStart(2, "0");

    const results = await QuizResult.find({
      userId: req.user._id,
      dateKey: { $regex: `^${y}-${m}` },
    }).lean();

    const quizMap = {};

    results.forEach((q) => {
      quizMap[q.dateKey] = {
        quizTitle: q.quizTitle,
        score: q.score,
        maxScore: q.maxScore,
        percentage: q.percentage,
        level: q.level,
      };
    });

    res.json(quizMap);

  } catch (err) {
    console.error("Quiz Month Fetch Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
