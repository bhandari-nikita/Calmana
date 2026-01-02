const express = require("express");
const Affirmation = require("../models/Affirmation");

const router = express.Router();

// ADD favorite
router.post("/add", async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "Missing userId or text" });
    }

    const exists = await Affirmation.findOne({ userId, text });
    if (exists) {
      return res.status(200).json({ message: "Already exists" });
    }

    const created = await Affirmation.create({ userId, text });
    res.status(201).json({ success: true, favorite: created });
  } catch (err) {
    console.error("Add affirmation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LIST favorites
router.get("/list/:userId", async (req, res) => {
  try {
    const entries = await Affirmation.find({ userId: req.params.userId });
    res.json({ success: true, favorites: entries });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE favorite
router.delete("/delete", async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "Missing userId or text" });
    }

    await Affirmation.deleteOne({ userId, text });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
