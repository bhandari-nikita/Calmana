const User = require("../models/User");
const Mood = require("../models/MoodEntry");
const Journal = require("../models/JournalEntry");
const Quiz = require("../models/QuizResult");
const Affirmation = require("../models/Affirmation");
const BreathingSession = require("../models/BreathingSession");

async function deleteUserCompletely(userId) {
  console.log("🔥 deleteUserCompletely CALLED for:", userId.toString());

  await Promise.all([
    Mood.deleteMany({ user: userId }),
    Journal.deleteMany({ user: userId }),
    Quiz.deleteMany({ userId }),
    Affirmation.deleteMany({ userId }),
    BreathingSession.deleteMany({ userId }),
    User.deleteOne({ _id: userId }),
  ]);

  console.log("🔥 deleteUserCompletely FINISHED for:", userId.toString());
}

module.exports = deleteUserCompletely;
