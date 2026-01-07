// calmana-backend/routes/dashboardRoutes.js
const express = require("express");
const connectDB = require("../db");
const { protect } = require("../middleware/auth");

const MoodEntry = require("../models/MoodEntry");
const BreathingSession = require("../models/BreathingSession");
const JournalEntry = require("../models/JournalEntry");
const QuizResult = require("../models/QuizResult"); // ⭐ ADD

const router = express.Router();
router.use(protect);

// router.get("/calendar", async (req, res) => {
//   try {
//     await connectDB();

//     const { year, month } = req.query;
//     if (!year || !month)
//       return res.status(400).json({ message: "year and month required" });

//     // const start = new Date(Date.UTC(year, month - 1, 1));
//     // const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

//     const startKey = `${year}-${String(month).padStart(2, "0")}-01`;
//     const endKey = `${year}-${String(month).padStart(2, "0")}-31`;

//     const [moods, journals, breaths] = await Promise.all([


//     MoodEntry.find({
//       user: req.user._id,
//       date: { $gte: startKey, $lte: endKey },
//     }),



//       JournalEntry.find({
//         user: req.user._id,
//         dateKey: { $regex: `^${year}-${String(month).padStart(2, "0")}` },
//       }),


//       BreathingSession.find({
//         userId: req.user._id,
//         dateKey: { $regex: `^${year}-${String(month).padStart(2, "0")}` },
//       })


//     ]);
// const days = {};

// // moods
// moods.forEach((m) => {
//   // const d = new Date(m.timestamp).getUTCDate();
//   // const iso = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

//   const iso = m.date; // already YYYY-MM-DD in UTC

//   days[iso] = days[iso] || {};
//   days[iso].mood = m.mood;
//   days[iso].moodValue = m.moodValue;
// });

// // journals
// journals.forEach((j) => {
//   const iso = j.dateKey; // YYYY-MM-DD
//   days[iso] = days[iso] || {};
//   days[iso].journalCount = (days[iso].journalCount || 0) + 1;
// });

// // breathing
// breaths.forEach((b) => {
//   const iso = b.dateKey; // YYYY-MM-DD
//   days[iso] = days[iso] || {};
//   days[iso].breathingCount =
//     (days[iso].breathingCount || 0) + (b.cyclesCompleted || 1);
// });

// res.json(days);

//   } catch (err) {
//   console.error("calendar error:", err);
//   res.status(500).json({ message: "Server error" });
// }
// });

function istDateKey(ts) {
  return new Date(ts).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}



router.get("/calendar", async (req, res) => {
  try {
    await connectDB();

    const { year, month } = req.query;
    if (!year || !month)
      return res.status(400).json({ message: "year and month required" });

    const y = String(year);
    const m = String(month).padStart(2, "0");

    const startKey = `${y}-${m}-01`;
    const endKey = `${y}-${m}-31`;

    const startUTC = new Date(`${y}-${m}-01T00:00:00.000Z`);
    const endUTC = new Date(`${y}-${m}-31T23:59:59.999Z`);

    const [moods, journals, breaths, quizzes] = await Promise.all([


      MoodEntry.find({
        user: req.user._id,
        timestamp: { $gte: startUTC, $lte: endUTC },
      }),


      JournalEntry.find({
        user: req.user._id,
        dateKey: { $regex: `^${y}-${m}` },
      }),

      BreathingSession.find({
        userId: req.user._id,
        dateKey: { $regex: `^${y}-${m}` },
      }),

      QuizResult.find({
        userId: req.user._id,
        dateKey: { $regex: `^${y}-${m}` },
      }),
    ]);


    const days = {};

    moods.forEach((mood) => {
      const iso = istDateKey(mood.timestamp);
      days[iso] = days[iso] || {};
      days[iso].mood = mood.mood;
      days[iso].moodValue = mood.moodValue;
    });


    journals.forEach((j) => {
      const iso = j.dateKey;
      days[iso] = days[iso] || {};
      days[iso].journalCount = (days[iso].journalCount || 0) + 1;
    });

    breaths.forEach((b) => {
      const iso = b.dateKey;
      days[iso] = days[iso] || {};
      days[iso].breathingCount =
        (days[iso].breathingCount || 0) + (b.cyclesCompleted || 1);
    });

    quizzes.forEach((q) => {
      const iso = q.dateKey;
      days[iso] = days[iso] || {};
      days[iso].quiz = {
        quizTitle: q.quizTitle,
        score: q.score,
        maxScore: q.maxScore,
        percentage: q.percentage,
        level: q.level,
      };
    });


    const todayKey = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    res.json({
      todayKey,
      days,
    });

  } catch (err) {
    console.error("calendar error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
