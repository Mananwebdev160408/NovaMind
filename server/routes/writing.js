const express = require('express');
const WritingDocument = require('../models/WritingDocument');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all drafts for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const drafts = await WritingDocument.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new draft
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, mode } = req.body;
    const draft = new WritingDocument({
      userId: req.user.id,
      title: title || 'Untitled Fragment',
      content: content || '',
      mode: mode || 'document'
    });
    await draft.save();
    res.status(201).json(draft);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update draft
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, mode } = req.body;
    const draft = await WritingDocument.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        title, 
        content, 
        mode, 
        lastModified: new Date() 
      },
      { new: true }
    );
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    res.json(draft);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete draft
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const draft = await WritingDocument.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    res.json({ message: 'Draft deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
