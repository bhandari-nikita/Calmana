//calmana-backend/models/Affirmation.js
const mongoose = require("mongoose");

const affirmationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    // IST-safe daily grouping
    dateKey: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }),
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt (SERVER time, UTC)
  }
);

module.exports = mongoose.model("Affirmation", affirmationSchema);
