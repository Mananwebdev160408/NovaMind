const mongoose = require('mongoose');

const codeSnippetSchema = new mongoose.Schema({
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
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'rust', 'go', 'ruby', 'php', 'other']
  },
  // AI-generated documentation
  documentation: {
    type: String,
    default: ''
  },
  explanation: {
    type: String,
    default: ''
  },
  // Code analysis
  complexity: {
    cyclomaticComplexity: Number,
    cognitiveComplexity: Number,
    linesOfCode: Number
  },
  issues: [{
    type: { type: String, enum: ['security', 'performance', 'style', 'smell'] },
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    message: String,
    line: Number,
    suggestion: String
  }],
  // Test suggestions
  testCases: [{
    description: String,
    testCode: String,
    category: { type: String, enum: ['unit', 'edge', 'error', 'integration'] }
  }],
  // Metadata
  tags: [String],
  starred: {
    type: Boolean,
    default: false
  },
  folder: String
}, {
  timestamps: true
});

// Index for search
codeSnippetSchema.index({ title: 'text', code: 'text', tags: 'text' });

module.exports = mongoose.model('CodeSnippet', codeSnippetSchema);
