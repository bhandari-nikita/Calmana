// calmana-backend/routes/adminAuth.js
const express = require("express");
const jwt = require("jsonwebtoken");


const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    token,
  });
});

module.exports = router;
