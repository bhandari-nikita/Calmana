require("dotenv").config();
const mongoose = require("mongoose");
const BreathingSession = require("../models/BreathingSession");

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  const sessions = await BreathingSession.find({
    dateKey: { $exists: false },
  });

  for (const s of sessions) {
    s.dateKey = getDateKey(s.createdAt);
    await s.save();
  }

  console.log("✅ Breathing migration complete");
  process.exit(0);
}

migrate();
