const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const MoodEntry = require("../models/MoodEntry");
const JournalEntry = require("../models/JournalEntry");
const BreathingSession = require("../models/BreathingSession");
const Affirmation = require("../models/Affirmation");

const router = express.Router();

router.use(auth.protect);

// DELETE ACCOUNT
router.delete("/delete", async (req, res) => {
  try {
    const userId = req.user.id;

    await Promise.all([
      MoodEntry.deleteMany({ user: userId }),
      JournalEntry.deleteMany({ user: userId }),
      BreathingSession.deleteMany({ user: userId }),
      Affirmation.deleteMany({ user: userId }),
      User.deleteOne({ _id: userId }),
    ]);

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({ ok: true, message: "Account deleted successfully." });
  } catch (err) {
    console.error("Account deletion error:", err);
    return res.status(500).json({ error: "Server error during account deletion" });
  }
});

module.exports = router;
