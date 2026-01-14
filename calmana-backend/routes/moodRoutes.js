// calmana-backend/routes/moodRoutes.js
const express = require("express");
const connectDB = require("../db");
const MoodEntry = require("../models/MoodEntry");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Mood → Numeric Map
const moodMap = {
  Excited: 7,
  Happy: 6,
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

function getISTKeyFromDate(d) {
  const ist = new Date(
    d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const day = String(ist.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}


router.get("/day", protect, async (req, res) => {
  try {
    await connectDB();

    let { date } = req.query;

    // 🔥 DEFAULT TO TODAY (IST)
    if (!date) {
      date = getISTDateKey();
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
      date,
      moods: entries,
      averageMood: avg,
    });
  } catch (err) {
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
  await connectDB();

  const offset = parseInt(req.query.offset || "0", 10);

  const istNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const day = istNow.getDay();
  const diff = (day === 0 ? -6 : 1) - day;

  const weekStart = new Date(istNow);
  weekStart.setDate(istNow.getDate() + diff + offset * 7);

  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);

    const key = getISTKeyFromDate(d);


    const entries = await MoodEntry.find({
      user: req.user._id,
      dateKey: key,
    });

    const avg =
      entries.length > 0
        ? entries.reduce((s, e) => s + e.moodValue, 0) / entries.length
        : null;

    days.push({ date: key, averageMood: avg });
  }

  res.json({
    days,
    start: days[0].date,
    end: days[6].date,
  });
});


// MONTH VIEW
router.get("/month", protect, async (req, res) => {
  await connectDB();

  const offset = parseInt(req.query.offset || "0", 10);

  const istNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const monthStart = new Date(
    istNow.getFullYear(),
    istNow.getMonth() + offset,
    1
  );

  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  ).getDate();

  const days = [];

  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(monthStart);
    d.setDate(monthStart.getDate() + i);

    const key = getISTKeyFromDate(d);

    const entries = await MoodEntry.find({
      user: req.user._id,
      dateKey: key,
    });

    const avg =
      entries.length > 0
        ? entries.reduce((s, e) => s + e.moodValue, 0) / entries.length
        : null;

    days.push({ date: key, averageMood: avg });
  }

  res.json({
    days,
    start: getISTKeyFromDate(monthStart),
  });
});



module.exports = router;
