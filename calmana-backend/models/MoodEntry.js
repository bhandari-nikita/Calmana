// calmana-backend/models/MoodEntry.js
const mongoose = require("mongoose");

const moodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mood: {
    type: String,
    required: true,
  },
  moodValue: {
    type: Number,
    required: true,
  },
  dateKey: {
    type: String, // YYYY-MM-DD (IST)
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, // UTC
  },
});

module.exports = mongoose.model("MoodEntry", moodEntrySchema);
