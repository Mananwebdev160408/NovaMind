const mongoose = require('mongoose');

const knowledgeNodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Node data
  concept: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  nodeType: {
    type: String,
    enum: ['note', 'document', 'code', 'meeting', 'idea', 'concept'],
    required: true
  },
  // References to source content
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['Note', 'Document', 'CodeSnippet', 'MeetingTranscript', 'WritingDocument']
  },
  // Relationships
  connections: [{
    targetNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeNode'
    },
    relationshipType: {
      type: String,
      enum: ['related', 'prerequisite', 'extends', 'contradicts', 'implements', 'references'],
      default: 'related'
    },
    strength: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    description: String
  }],
  // Clustering
  cluster: String,
  // Visual positioning (for graph layout persistence)
  position: {
    x: Number,
    y: Number
  },
  // Metadata
  tags: [String],
  importance: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient graph queries
knowledgeNodeSchema.index({ userId: 1, concept: 'text', tags: 'text' });
knowledgeNodeSchema.index({ userId: 1, cluster: 1 });

module.exports = mongoose.model('KnowledgeNode', knowledgeNodeSchema);
