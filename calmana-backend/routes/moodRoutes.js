// calmana-backend/routes/moodRoutes.js
const express = require("express");
const connectDB = require("../db");
const MoodEntry = require("../models/MoodEntry");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Mood → Numeric Map
const moodMap = {
  Happy: 7,
  Excited: 6,
  Calm: 5,
  Neutral: 4,
  Tired: 3,
  Sad: 2,
  Angry: 1,
};

function getISTDateKey() {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

router.get("/day", protect, async (req, res) => {
  try {
    await connectDB();

    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date required" });
    }

    const entries = await MoodEntry.find({
      user: req.user._id,
      dateKey: date,
    }).sort({ timestamp: 1 });

    const avg =
      entries.length
        ? entries.reduce((s, e) => s + e.moodValue, 0) / entries.length
        : null;

    res.json({
      date,              // 🔥 THIS WAS MISSING
      moods: entries,
      averageMood: avg,
    });

  } catch (err) {
    console.error("Mood day error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ADD MOOD ENTRY
router.post("/add", protect, async (req, res) => {
  try {
    await connectDB();

    const { mood } = req.body;

    if (!mood || !moodMap[mood]) {
      return res.status(400).json({ message: "Invalid mood" });
    }

    // const now = new Date();
    // const isoDate = now.toISOString().split("T")[0];

    // const entry = await MoodEntry.create({
    //   user: req.user._id,
    //   mood,
    //   moodValue: moodMap[mood],
    //   date: isoDate,
    //   timestamp: new Date(),
    // });




    const entry = await MoodEntry.create({
      user: req.user._id,
      mood,
      moodValue: moodMap[mood],
      dateKey: getISTDateKey(), // 🔒 source of truth
      timestamp: new Date(),    // still useful
    });



    res.status(201).json(entry);
  } catch (err) {
    console.error("Mood add error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET TODAY'S MOODS


// WEEK VIEW
router.get("/week", protect, async (req, res) => {
  try {
    await connectDB();

    const offset = parseInt(req.query.offset || "0", 10);

    // FORCE IST
    const now = new Date();
    const istNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const day = istNow.getDay();
    const diff = (day === 0 ? -6 : 1) - day;

    const istWeekStart = new Date(istNow);
    istWeekStart.setDate(istNow.getDate() + diff);
    istWeekStart.setHours(0, 0, 0, 0);

    const istWeekEnd = new Date(istWeekStart);
    istWeekEnd.setDate(istWeekStart.getDate() + 6);
    istWeekEnd.setHours(23, 59, 59, 999);


    const startUTC = new Date(istWeekStart.toISOString());
    const endUTC = new Date(istWeekEnd.toISOString());

    const entries = await MoodEntry.find({
      user: req.user._id,
      timestamp: { $gte: startUTC, $lt: endUTC },
    });



    const days = [];

    for (let i = 0; i < 7; i++) {
      const istDayStart = new Date(istWeekStart);
      istDayStart.setDate(istWeekStart.getDate() + i);

      const istDayEnd = new Date(istDayStart);
      istDayEnd.setHours(23, 59, 59, 999);

      const dayEntries = entries.filter(e => {
        const istTime = new Date(
          e.timestamp.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );
        return istTime >= istDayStart && istTime <= istDayEnd;
      });

      const avg =
        dayEntries.length
          ? dayEntries.reduce((s, e) => s + e.moodValue, 0) / dayEntries.length
          : null;

      days.push({
        date: istDayStart.toISOString().slice(0, 10),
        averageMood: avg,
      });
    }

    res.set("Cache-Control", "no-store");

    res.json({
      days,
      start: istWeekStart,
      end: istWeekEnd,
    });

  } catch (err) {
    console.error("Week error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// MONTH VIEW
router.get("/month", protect, async (req, res) => {
  try {
    await connectDB();

    const offset = parseInt(req.query.offset || "0", 10);
    const istNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const istMonthStart = new Date(
      istNow.getFullYear(),
      istNow.getMonth() + offset,
      1
    );
    istMonthStart.setHours(0, 0, 0, 0);

    const istMonthEnd = new Date(
      istMonthStart.getFullYear(),
      istMonthStart.getMonth() + 1,
      0,
      23, 59, 59, 999
    );

    // const entries = await MoodEntry.find({
    //   user: req.user._id,
    //   timestamp: { $gte: start, $lte: end },
    // });

    const startUTC = new Date(istMonthStart.toISOString());
    const endUTC = new Date(istMonthEnd.toISOString());

    const entries = await MoodEntry.find({
      user: req.user._id,
      timestamp: { $gte: startUTC, $lte: endUTC },
    });



    const days = [];

    for (let i = 1; i <= istMonthEnd.getDate(); i++) {

      // const dayEntries = entries.filter((e) => {
      //   const d = new Date(e.timestamp);
      //   return d.toDateString() === dayDate.toDateString();
      // });

      const istDayStart = new Date(istMonthStart);
      istDayStart.setDate(istMonthStart.getDate() + (i - 1));

      const istDayEnd = new Date(istDayStart);
      istDayEnd.setHours(23, 59, 59, 999);

      const dayEntries = entries.filter(e => {
        const istTime = new Date(
          e.timestamp.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );
        return istTime >= istDayStart && istTime <= istDayEnd;
      });


      const avg =
        dayEntries.length > 0
          ? dayEntries.reduce((s, e) => s + e.moodValue, 0) / dayEntries.length
          : null;

      // days.push({
      //   date: dayDate.toLocaleDateString(),
      //   averageMood: avg,
      // });

      days.push({
        date: istDayStart.toISOString().slice(0, 10),
        averageMood: avg,
      });


    }

    res.json({
      days,
      start: istMonthStart,
      end: istMonthEnd,
    });

  } catch (err) {
    console.error("Month error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
