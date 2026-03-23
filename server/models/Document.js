const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'json'],
    default: 'txt'
  },
  size: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  chunks: [{
    content: String,
    page: Number,
    section: String
  }],
  entities: [{
    type: { type: String },
    value: String,
    context: String
  }],
  summary: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for search
documentSchema.index({ name: 'text', content: 'text', 'entities.value': 'text' });

module.exports = mongoose.model('Document', documentSchema);
