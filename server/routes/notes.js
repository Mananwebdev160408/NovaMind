const express = require('express');
const Note = require('../models/Note');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all notes for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, category, isPinned, isFavorite } = req.body;
    const note = new Note({
      userId: req.user.id,
      title,
      content,
      tags: tags || [],
      category: category || 'personal',
      isPinned: isPinned || false,
      isFavorite: isFavorite || false
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update note
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, category, isPinned, isFavorite } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        title, 
        content, 
        tags, 
        category, 
        isPinned, 
        isFavorite, 
        lastModified: new Date() 
      },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
