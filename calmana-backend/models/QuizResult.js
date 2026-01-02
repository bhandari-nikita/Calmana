//calmana-backend/models/QuizResult.js
const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
  },

  quizSlug: { type: String, required: true },
  quizTitle: { type: String },

  answers: [
    {
      question: String,
      value: Number,
      index: Number,
    },
  ],

  score: Number,
  maxScore: Number,
  percentage: Number,
  level: String,

  dateKey: { type: String, required: true }, // ⭐ ADD THIS
  takenAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("QuizResult", QuizResultSchema);
