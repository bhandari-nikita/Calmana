require("dotenv").config();
const mongoose = require("mongoose");
const JournalEntry = require("../models/JournalEntry");

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  const journals = await JournalEntry.find({
    dateKey: { $exists: false }
  });

  console.log(`Found ${journals.length} journals to migrate`);

  for (const j of journals) {
    const sourceDate = j.date || j.createdAt;
    j.dateKey = getDateKey(sourceDate);
    await j.save();
  }

  console.log("✅ Journal migration complete");
  process.exit();
}

migrate();
