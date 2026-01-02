// calmana-backend/routes/journal.js
const express = require('express');
const { protect } = require('../middleware/auth');   // FIXED
const JournalEntry = require('../models/JournalEntry');
const { encryptText, decryptText } = require('../utils/crypto');

const router = express.Router();

const getDateKey = require('../utils/dateKey');

// FIXED — use protect middleware, not the whole auth object
router.use(protect);

// Helper: convert DB doc -> plaintext entry returned to client
function docToPlain(doc) {
  const plainText = (() => {
    try {
      return decryptText({ content: doc.content, iv: doc.iv, tag: doc.tag });
    } catch (e) {
      console.error('Decryption failed for journal', doc._id, e.message);
      return ''; // keep safe
    }
  })();

  return {
    _id: doc._id,
    title: doc.title || '',
    text: plainText,
    tags: doc.tags || [],
    date: doc.dateKey,

    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

// CREATE
router.post('/', async (req, res) => {
  try {
    const { text, title = '', tags = [], date } = req.body;
    date: date ? new Date(date) : Date.now()

    if (!text) return res.status(400).json({ error: 'Text is required' });

    const { content, iv, tag } = encryptText(text);

    const now = new Date();           // SERVER TIME
    const dateKey = getDateKey(now); // YYYY-MM-DD (UTC)

    const entry = new JournalEntry({
      user: req.user.id,
      content, iv, tag,
      title,
      tags,
      dateKey,
      createdAt: now
    });

    await entry.save();
    return res.json(docToPlain(entry));
  } catch (err) {
    console.error('Journal POST error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET all for user (latest first)
router.get('/', async (req, res) => {
  try {
    const docs = await JournalEntry.find({ user: req.user.id }).sort('-date').limit(1000);
    const items = docs.map(docToPlain);
    return res.json({ entries: items });
  } catch (err) {
    console.error('Journal GET error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET single by id
router.get('/:id', async (req, res) => {
  try {
    const doc = await JournalEntry.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json(docToPlain(doc));
  } catch (err) {
    console.error('Journal GET by id error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET entries by day
// router.get('/day', async (req, res) => {
//   try {
//     const dateStr = req.query.date;
//     if (!dateStr) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });

//     const day = new Date(dateStr);
//     if (isNaN(day)) return res.status(400).json({ error: 'Invalid date' });

//     const start = new Date(day);
//     start.setHours(0, 0, 0, 0);
//     const end = new Date(day);
//     end.setHours(23, 59, 59, 999);

//     const docs = await JournalEntry.find({
//       user: req.user.id,
//       date: { $gte: start, $lte: end }
//     }).sort('date');

//     const items = docs.map(docToPlain);
//     return res.json({ entries: items, count: items.length });
//   } catch (err) {
//     console.error('Journal GET by day error:', err);
//     return res.status(500).json({ error: err.message });
//   }
// });

router.get('/day', async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ error: 'date required' });

    const docs = await JournalEntry.find({
      user: req.user.id,
      dateKey: date
    }).sort({ createdAt: 1 });

    return res.json({
      entries: docs.map(docToPlain),
      count: docs.length
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// UPDATE
router.put('/', async (req, res) => {
  try {
    const { id, text, title = '', tags = [], date } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const doc = await JournalEntry.findOne({ _id: id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    if (typeof text === 'string') {
      const { content, iv, tag } = encryptText(text);
      doc.content = content;
      doc.iv = iv;
      doc.tag = tag;
    }
    doc.title = title;
    doc.tags = tags;
    if (date) doc.date = new Date(date);

    await doc.save();
    return res.json(docToPlain(doc));
  } catch (err) {
    console.error('Journal PUT error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/', async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id required' });
    const doc = await JournalEntry.findOneAndDelete({ _id: id, user: req.user.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Journal DELETE error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
