//  calmana-backend/models/JournalEntry.js
const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  content: { type: String, required: true },
  iv: { type: String, required: true },
  tag: { type: String, required: true },

  title: String,
  tags: [String],

  // 🔑 SERVER-CONTROLLED DAY KEY
  dateKey: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});


journalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('JournalEntry', journalSchema);
