const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  // AI-generated metadata
  summary: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    enum: ['meeting', 'idea', 'research', 'task', 'personal', 'project', 'learning', 'other'],
    default: 'personal'
  },
  // Flashcards generated from note
  flashcards: [{
    question: String,
    answer: String,
    nextReview: Date,
    reviewCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 }
  }],
  // Related notes
  relatedNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }],
  // Organization
  folder: {
    type: String,
    default: ''
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  // Health score (0-100)
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  wordCount: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for text search
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);
