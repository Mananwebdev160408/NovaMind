const mongoose = require('mongoose');

const languageProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetLanguage: {
    type: String,
    required: true
  },
  // Vocabulary SRS
  vocabulary: [{
    word: String,
    translation: String,
    context: String,
    difficulty: Number,
    nextReview: Date,
    reviewCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    lastReviewScore: Number,
    addedAt: { type: Date, default: Date.now }
  }],
  // Pronunciation tracking
  pronunciationScores: [{
    sentence: String,
    score: Number,
    phonemeBreakdown: [{
      phoneme: String,
      accuracy: Number
    }],
    recordedAt: { type: Date, default: Date.now }
  }],
  // Conversation sessions
  conversationSessions: [{
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    topic: String,
    messages: [{
      role: { type: String, enum: ['user', 'ai'] },
      content: String,
      timestamp: Date
    }],
    feedback: String,
    duration: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  // Grammar corrections
  grammarCorrections: [{
    original: String,
    corrected: String,
    explanation: String,
    category: String,
    timestamp: { type: Date, default: Date.now }
  }],
  // Progress metrics
  stats: {
    totalPracticeTime: { type: Number, default: 0 }, // in minutes
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastPracticeDate: Date,
    vocabularySize: { type: Number, default: 0 },
    averagePronunciationScore: { type: Number, default: 0 },
    conversationsCompleted: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LanguageProgress', languageProgressSchema);
