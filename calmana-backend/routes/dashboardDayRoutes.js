// calmana-backend/routes/dashboardDayRoutes.js
const express = require("express");
const connectDB = require("../db");
const { protect } = require("../middleware/auth");

const MoodEntry = require("../models/MoodEntry");
const BreathingSession = require("../models/BreathingSession");
const JournalEntry = require("../models/JournalEntry");
const QuizResult = require("../models/QuizResult");   // ⭐ ADDED
const { decryptText } = require("../utils/crypto");

const getIndiaDayRange = require("../utils/indiaDayRange");

const router = express.Router();
router.use(protect);

// console.log("🔥 dashboardDayRoutes loaded");

// Convert YYYY-MM-DD -> local start & end of that day
function getDayRangeLocal(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [year, month, day] = dateStr.split("-").map(Number);

  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);

  return { start, end };
}

// GET /dashboard/day?date=YYYY-MM-DD
router.get("/day", async (req, res) => {
  try {
    await connectDB();

    const dateStr = req.query.date;
    if (!dateStr) {
      return res.status(400).json({ message: "date=YYYY-MM-DD required" });
    }

    // const range = getDayRangeLocal(dateStr);
    // if (!range) {
    //   return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    // }
    // const { start, end } = range;

    // const range = getDayRangeLocal(dateStr);
    // if (!range) {
    //   return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    // }

    // const { start, end } = range;
    const { start, end } = getIndiaDayRange(dateStr);




    // Fetch everything in parallel for speed
    // UTC date range for quiz fetch


    // const quizStart = new Date(`${dateStr}T00:00:00.000Z`);
    // const quizEnd = new Date(`${dateStr}T23:59:59.999Z`);

    const [moods, breaths, journalDocs, quizResults] = await Promise.all([
      MoodEntry.find({
        user: req.user._id,
        timestamp: { $gte: start, $lte: end },  // local
      }).sort("timestamp"),

      BreathingSession.find({
        userId: req.user._id,
        createdAt: { $gte: start, $lte: end },  // local
      }).sort("createdAt"),

      JournalEntry.find({
        user: req.user._id,
        dateKey: dateStr
      }).sort("createdAt"),




      // ⭐ UTC-SAFE quiz fetch ⭐
      QuizResult.find({
        userId: req.user._id,
        takenAt: { $gte: start, $lte: end },
      }).sort("takenAt")
      ,
    ]);



    // Decrypt Journals
    const journals = journalDocs.map((j) => {
      let text = "";
      try {
        if (j.content && j.iv && j.tag) {
          text = decryptText({
            content: j.content,
            iv: j.iv,
            tag: j.tag,
          });
        }
      } catch (err) {
        console.error("Decrypt error for journal", j._id, err.message || err);
      }

      return {
        id: j._id,
        title: j.title || "",
        text,
        date: j.dateKey || j.createdAt.toISOString().slice(0, 10),
      };


    });

    // Breathing summary
    const breathing = {
      totalCycles: breaths.reduce((sum, b) => sum + (b.cyclesCompleted || 0), 0),
      sessions: breaths.map((b) => ({
        cyclesCompleted: b.cyclesCompleted,
        createdAt: b.createdAt,
      })),
    };

    // Average mood
    const averageMood =
      moods.length > 0
        ? moods.reduce((s, e) => s + (e.moodValue || 0), 0) / moods.length
        : null;

    // ⭐ PICK FIRST QUIZ RESULT OF THE DAY (like calendar)
    const quiz = quizResults.length > 0 ? quizResults[0] : null;

    return res.json({
      date: dateStr,
      moods,
      journals,
      breathing,
      averageMood,
      quizzes: quizResults,
    });

  } catch (err) {
    console.error("dashboard/day error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
