// calmana-backend/routes/breathingRoutes.js
const express = require("express");
const BreathingSession = require("../models/BreathingSession");

const router = express.Router();

const getDateKey = require("../utils/dateKey");

// Save breathing session
router.post("/save", async (req, res) => {
  try {

    console.log("BODY RECEIVED:", req.body);

    const { userId, cyclesCompleted } = req.body;

    if (!userId || cyclesCompleted === undefined || cyclesCompleted === null) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or cyclesCompleted",
      });
    }

    const now = new Date();
    const dateKey = getDateKey(now);

    const session = await BreathingSession.create({
      userId,
      cyclesCompleted,
      dateKey,
      createdAt: now,
    });


    res.status(201).json({
      success: true,
      message: "Breathing session saved",
      data: session,
    });
  } catch (error) {
    console.error("Error saving breathing session:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get today's breathing cycles for a user
router.get("/today", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    const todayKey = getDateKey(new Date());

    const sessions = await BreathingSession.find({
      userId,
      dateKey: todayKey,
    });

    const totalCycles = sessions.reduce(
      (sum, s) => sum + s.cyclesCompleted,
      0
    );

    res.json({
      success: true,
      totalCycles,
    });
  } catch (error) {
    console.error("Error fetching today's breathing:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


module.exports = router;
