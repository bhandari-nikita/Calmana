// calmana-backend/models/MoodEntry.js
const mongoose = require("mongoose");

const moodEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mood: { type: String, required: true },
  moodValue: { type: Number, required: true },
  date: { type: String, required: true },      // <--- MUST HAVE THIS
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MoodEntry", moodEntrySchema);
