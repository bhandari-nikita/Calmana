// calmana-backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect middleware (for both user and admin)
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer "))
      return res.status(401).json({ error: "Not authorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;  // attaches full user object including role
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Token invalid or expired" });
  }
}

// Admin-only middleware
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}

module.exports = { protect, adminOnly };
