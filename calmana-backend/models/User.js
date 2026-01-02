//
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },  // 👈 Add this
  createdAt: { type: Date, default: Date.now }
});

// Ensure unique indexes
// userSchema.index({ username: 1 }, { unique: true });
// userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
