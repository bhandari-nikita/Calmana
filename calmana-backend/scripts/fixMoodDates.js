require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const connectDB = require("../db");
const MoodEntry = require("../models/MoodEntry");


async function fixMoodDates() {
  await connectDB();

  const moods = await MoodEntry.find({});
  console.log(`Found ${moods.length} mood entries`);

  for (const m of moods) {
    const correctDate = m.timestamp.toISOString().slice(0, 10);

    if (m.date !== correctDate) {
      console.log(
        `Fixing ${m._id}: ${m.date} → ${correctDate}`
      );
      m.date = correctDate;
      await m.save();
    }
  }

  console.log("✅ Mood date migration completed");
  process.exit(0);
}

fixMoodDates().catch(err => {
  console.error(err);
  process.exit(1);
});
