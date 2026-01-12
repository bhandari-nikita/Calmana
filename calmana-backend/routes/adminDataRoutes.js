//calmana-backend/routes/adminDataRoutes.js
const express = require("express");
const router = express.Router();
const adminProtect = require("../middleware/adminProtect");

const User = require("../models/User");
const Mood = require("../models/MoodEntry");
const Journal = require("../models/JournalEntry");
const Quiz = require("../models/QuizResult");
const Affirmation = require("../models/Affirmation");
const BreathingSession = require("../models/BreathingSession");

// cache
const NodeCache = require("node-cache");
const analyticsCache = new NodeCache({ stdTTL: 30 });

// Helpers
function parseRange(req, defaultDays = 7) {
  let { start, end } = req.query;
  if (!start || !end) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (defaultDays - 1));
    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
    };
  }
  return { start, end };
}

function toDayRange(startStr, endStr) {
  const start = new Date(startStr + "T00:00:00.000Z");
  const end = new Date(endStr + "T23:59:59.999Z");
  return { start, end };
}

// SUMMARY
router.get("/summary", adminProtect, async (req, res) => {
  try {
    const { start, end } = parseRange(req, 7);
    const { start: s, end: e } = toDayRange(start, end);

    // Total users (global)
    const totalUsers = await User.countDocuments();

    // Range-based counts
    const totalMoods = await Mood.countDocuments({
      timestamp: { $gte: s, $lte: e }
    });

    const totalBreathing = await BreathingSession.countDocuments({
      createdAt: { $gte: s, $lte: e }
    });

    // Active users in selected range
    const activeUsersInRange = await Mood.distinct("user", {
      timestamp: { $gte: s, $lte: e }
    });

    // Active today
    const today = new Date().toISOString().slice(0, 10);
    const todayStart = new Date(today + "T00:00:00.000Z");
    const todayEnd = new Date(today + "T23:59:59.999Z");

    const activeTodayUsers = await Mood.distinct("user", {
      timestamp: { $gte: todayStart, $lte: todayEnd }
    });

    res.json({
      totalUsers,
      activeToday: activeTodayUsers.length,
      moodLoggingRate:
        activeUsersInRange.length > 0
          ? Number((totalMoods / activeUsersInRange.length).toFixed(1))
          : 0,
      avgBreathingPerUser:
        activeUsersInRange.length > 0
          ? Number((totalBreathing / activeUsersInRange.length).toFixed(1))
          : 0
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to load summary" });
  }
});


// USERS LIST
router.get("/users", adminProtect, async (req, res) => {
  const users = await User.find().select("-passwordHash");
  res.json(users);
});

// JOURNALS METADATA ONLY
router.get("/journals", adminProtect, async (req, res) => {
  const journals = await Journal.find()
    .populate("user", "username email")
    .select("user date title createdAt");

  res.json(journals);
});

// AFFIRMATIONS SUMMARY
router.get("/affirmations-summary", adminProtect, async (req, res) => {
  const summary = await Affirmation.aggregate([
    { $group: { _id: "$text", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json(summary);
});

// BREATHING SUMMARY
router.get("/breathing-summary", adminProtect, async (req, res) => {
  const totalSessions = await BreathingSession.countDocuments();
  res.json({ totalSessions });
});

// DELETE USER
router.delete("/users/:id", adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin") return res.status(403).json({ error: "Cannot delete admin" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE JOURNAL
router.delete("/journals/:id", adminProtect, async (req, res) => {
  try {
    const j = await Journal.findById(req.params.id);
    if (!j) return res.status(404).json({ error: "Journal not found" });

    await Journal.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// FULL DATA – MOODS
router.get("/moods", adminProtect, async (req, res) => {
  const moods = await Mood.find().populate("user", "username email");
  res.json(moods);
});

// FULL DATA – QUIZZES
router.get("/quizzes", adminProtect, async (req, res) => {
  const quizzes = await Quiz.find().populate("userId", "username email");
  res.json(quizzes);
});

// FULL DATA – BREATHING
router.get("/breathing", adminProtect, async (req, res) => {
  const sessions = await BreathingSession.find().populate("userId", "username email");
  res.json(sessions);
});

// FULL DATA – AFFIRMATIONS
router.get("/affirmations", adminProtect, async (req, res) => {
  const aff = await Affirmation.find().populate("userId", "username email");
  res.json(aff);
});

// ANALYTICS – MOOD TREND
router.get("/analytics/mood-trend", adminProtect, async (req, res) => {
  try {
    const { start, end } = parseRange(req, 7);
    const cacheKey = `mood-trend:${start}:${end}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) return res.json(cached);

    const { start: s, end: e } = toDayRange(start, end);

    const trend = await Mood.aggregate([
      { $match: { timestamp: { $gte: s, $lte: e } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const map = {};
    trend.forEach(t => map[t._id] = t.count);

    const days = [];
    const sd = new Date(start);
    const ed = new Date(end);

    for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: map[key] || 0 });
    }

    analyticsCache.set(cacheKey, days);
    res.json(days);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ANALYTICS – DAILY ACTIVE USERS
router.get("/analytics/daily-active-users", adminProtect, async (req, res) => {
  try {
    const { start, end } = parseRange(req, 7);
    const cacheKey = `dau:${start}:${end}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) return res.json(cached);

    const { start: s, end: e } = toDayRange(start, end);

    // helper for raw pairs
    async function raw(Model, dateField, userField) {
      return Model.aggregate([
        { $match: { [dateField]: { $gte: s, $lte: e } } },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
            user: `$${userField}`
          }
        }
      ]);
    }

    const moodRaw = await raw(Mood, "timestamp", "user");
    const journalRaw = await raw(Journal, "createdAt", "user");
    const quizRaw = await raw(Quiz, "takenAt", "userId");
    const breathRaw = await raw(BreathingSession, "createdAt", "userId");

    const combined = {};
    [moodRaw, journalRaw, quizRaw, breathRaw].forEach(list => {
      list.forEach(r => {
        combined[r.date] = combined[r.date] || new Set();
        if (r.user) combined[r.date].add(String(r.user));
      });
    });

    const result = [];
    const sd = new Date(start);
    const ed = new Date(end);

    for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, activeUsers: combined[key] ? combined[key].size : 0 });
    }

    analyticsCache.set(cacheKey, result);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ANALYTICS – QUIZ DISTRIBUTION
router.get("/analytics/quiz-distribution", adminProtect, async (req, res) => {
  try {
    const { start, end } = parseRange(req, 30);
    const cacheKey = `quiz-dist:${start}:${end}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) return res.json(cached);

    const { start: s, end: e } = toDayRange(start, end);

    const dist = await Quiz.aggregate([
      { $match: { takenAt: { $gte: s, $lte: e } } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $project: { label: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    analyticsCache.set(cacheKey, dist);
    res.json(dist);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ANALYTICS – PEAK HOUR
// router.get("/analytics/peak-hour", adminProtect, async (req, res) => {
//   try {
//     const { start, end } = parseRange(req, 30);
//     const cacheKey = `peak:${start}:${end}`;
//     const cached = analyticsCache.get(cacheKey);
//     if (cached) return res.json(cached);

//     const { start: s, end: e } = toDayRange(start, end);

//     const byHour = async (Model, dateField) =>
//       Model.aggregate([
//         { $match: { [dateField]: { $gte: s, $lte: e } } },
//         { $project: { hour: { $hour: `$${dateField}` } } },
//         { $group: { _id: "$hour", count: { $sum: 1 } } }
//       ]);

//     const [mood, journal, quiz, breath] = await Promise.all([
//       byHour(Mood, "timestamp"),
//       byHour(Journal, "createdAt"),
//       byHour(Quiz, "takenAt"),
//       byHour(BreathingSession, "createdAt")
//     ]);

//     const totals = {};
//     [mood, journal, quiz, breath].forEach(list => {
//       list.forEach(r => {
//         totals[r._id] = (totals[r._id] || 0) + r.count;
//       });
//     });

//     let peakHour = 0, peakCount = 0;
//     Object.keys(totals).forEach(h => {
//       if (totals[h] > peakCount) {
//         peakCount = totals[h];
//         peakHour = Number(h);
//       }
//     });

//     const out = { peakHour, peakCount };
//     analyticsCache.set(cacheKey, out);
//     res.json(out);

//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// ANALYTICS – AFFIRMATION POPULARITY
router.get("/analytics/affirmation-popularity", adminProtect, async (req, res) => {
  try {
    const { start, end } = parseRange(req, 30);
    const cacheKey = `aff:${start}:${end}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached) return res.json(cached);

    const { start: s, end: e } = toDayRange(start, end);

    const summary = await Affirmation.aggregate([
      { $match: { date: { $gte: s, $lte: e } } },
      { $group: { _id: "$text", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    analyticsCache.set(cacheKey, summary);
    res.json(summary);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
