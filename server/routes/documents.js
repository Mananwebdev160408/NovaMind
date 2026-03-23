const express = require('express');
const Document = require('../models/Document');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all documents metadata (no heavy content)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id })
      .select('-content -chunks -entities')
      .sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get specific document with content
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new document (Ingestion)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, type, size, content, chunks, entities, summary } = req.body;
    const doc = new Document({
      userId: req.user.id,
      name,
      type: type || 'txt',
      size,
      content,
      chunks: chunks || [],
      entities: entities || [],
      summary
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete document
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
