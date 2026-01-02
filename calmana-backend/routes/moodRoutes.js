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


    const now = new Date();

    // FORCE UTC DATE KEY
    const dateKey = now.toISOString().slice(0, 10);

    const entry = await MoodEntry.create({
      user: req.user._id,
      mood,
      moodValue: moodMap[mood],
      date: dateKey,
      timestamp: now, // keep full timestamp for ordering
    });


    res.status(201).json(entry);
  } catch (err) {
    console.error("Mood add error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET TODAY'S MOODS
router.get("/today", protect, async (req, res) => {
  try {
    await connectDB();

    // const start = new Date();
    // start.setHours(0, 0, 0, 0);

    // const end = new Date();
    // end.setHours(23, 59, 59, 999);


    const now = new Date();

    const start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    const end = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));


    const entries = await MoodEntry.find({
      user: req.user._id,
      timestamp: { $gte: start, $lte: end },
    }).sort({ timestamp: 1 });

    const avg =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.moodValue, 0) / entries.length
        : null;

    res.json({ moods: entries, averageMood: avg });
  } catch (err) {
    console.error("Mood today error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// WEEK VIEW
router.get("/week", protect, async (req, res) => {
  try {
    await connectDB();

    const offset = parseInt(req.query.offset || "0", 10);

    // FORCE IST
    const now = new Date();
    const istNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    // Monday-based week
    const day = istNow.getDay(); // Sun=0, Mon=1 ...
    const diff = (day === 0 ? -6 : 1) - day;

    const weekStart = new Date(istNow);
    weekStart.setDate(istNow.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    // apply offset
    const start = new Date(weekStart);
    start.setDate(start.getDate() + offset * 7);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);


    // const entries = await MoodEntry.find({
    //   user: req.user._id,
    //   timestamp: { $gte: start, $lte: end },
    // });

    const startKey = start.toISOString().slice(0, 10);
    const endKey = end.toISOString().slice(0, 10);

    const entries = await MoodEntry.find({
      user: req.user._id,
      date: { $gte: startKey, $lte: endKey },
    });


    const days = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + i);

      // const dayEntries = entries.filter((e) => {
      //   const d = new Date(e.timestamp);
      //   return d.toDateString() === dayDate.toDateString();
      // });


      const dayKey = dayDate.toISOString().slice(0, 10);

      const dayEntries = entries.filter(e => e.date === dayKey);


      const avg =
        dayEntries.length > 0
          ? dayEntries.reduce((s, e) => s + e.moodValue, 0) / dayEntries.length
          : null;

      // days.push({
      //   date: dayDate.toLocaleDateString(),
      //   averageMood: avg,
      // });

      days.push({
        date: dayKey,
        averageMood: avg,
      });

    }

    res.json({
      days,
      start,
      end,
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
    const today = new Date();

    const start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);

    // const entries = await MoodEntry.find({
    //   user: req.user._id,
    //   timestamp: { $gte: start, $lte: end },
    // });

    const startKey = start.toISOString().slice(0, 10);
    const endKey = end.toISOString().slice(0, 10);

    const entries = await MoodEntry.find({
      user: req.user._id,
      date: { $gte: startKey, $lte: endKey },
    });


    const days = [];

    for (let i = 1; i <= end.getDate(); i++) {
      const dayDate = new Date(start.getFullYear(), start.getMonth(), i);

      // const dayEntries = entries.filter((e) => {
      //   const d = new Date(e.timestamp);
      //   return d.toDateString() === dayDate.toDateString();
      // });

      const dayKey = dayDate.toISOString().slice(0, 10);

      const dayEntries = entries.filter(e => e.date === dayKey);


      const avg =
        dayEntries.length > 0
          ? dayEntries.reduce((s, e) => s + e.moodValue, 0) / dayEntries.length
          : null;

      // days.push({
      //   date: dayDate.toLocaleDateString(),
      //   averageMood: avg,
      // });

      days.push({
        date: dayKey,
        averageMood: avg,
      });

    }

    res.json({
      days,
      start,
    });
  } catch (err) {
    console.error("Month error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
