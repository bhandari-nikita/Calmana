// calmana-backend/models/BreathingSession.js
const mongoose = require("mongoose");

const breathingSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cyclesCompleted: {
      type: Number,
      required: true,
      min: 1,
    },

    // 🔑 SERVER-CONTROLLED DAY KEY
    dateKey: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BreathingSession", breathingSessionSchema);
