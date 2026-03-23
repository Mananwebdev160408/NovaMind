const mongoose = require('mongoose');

const writingDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Fragment'
  },
  content: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    enum: ['email', 'document', 'blog', 'creative', 'cover-letter', 'proposal'],
    default: 'document'
  },
  // Tone and style
  tone: {
    type: String,
    enum: ['formal', 'casual', 'persuasive', 'empathetic', 'concise', 'executive'],
    default: 'formal'
  },
  // Version history
  versions: [{
    content: String,
    diffSummary: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // Metrics
  metrics: {
    wordCount: { type: Number, default: 0 },
    readabilityScore: { type: Number, default: 0 },
    passiveVoiceCount: { type: Number, default: 0 },
    fillerWordCount: { type: Number, default: 0 },
    sentenceCount: { type: Number, default: 0 },
    avgSentenceLength: { type: Number, default: 0 }
  },
  // Goals
  wordGoal: {
    type: Number,
    default: 0
  },
  // Metadata
  tags: [String],
  folder: String,
  isStarred: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for search
writingDocumentSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('WritingDocument', writingDocumentSchema);
