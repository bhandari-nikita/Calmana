// backend/routes/userRoutes.js
import express from "express";
import connectDB from "../db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🟢 REGISTER route
router.post("/register", async (req, res) => {
  await connectDB();
  console.log("Received data:", req.body);
  try {
    const { fullname, email, password, dob, gender, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      dob,
      gender,
      location,
      role: "user", // default role
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token + user data
    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, fullname: user.fullname, email: user.email, dob: user.dob, gender: user.gender, location: user.location, role: user.role },
    });
  } catch (error) {
    console.error("Registration error details:", error);
    res.status(400).json({
      message: "Registration failed",
      error: error.message,
      stack: error.stack,
    });
  }

});

// 🟢 LOGIN route
router.post("/login", async (req, res) => {
  console.log("📩 Login route hit", req.body);
  await connectDB();
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Login failed" });
  }
});

export default router;
