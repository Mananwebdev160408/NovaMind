const mongoose = require('mongoose');

const meetingTranscriptSchema = new mongoose.Schema({
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
  // Raw transcription
  transcript: {
    type: String,
    default: ''
  },
  // Segmented by speaker
  segments: [{
    speaker: String,
    text: String,
    startTime: Number,
    endTime: Number,
    confidence: Number
  }],
  // AI-extracted intelligence
  summary: {
    type: String,
    default: ''
  },
  actionItems: [{
    text: String,
    owner: String,
    deadline: Date,
    completed: { type: Boolean, default: false }
  }],
  decisions: [{
    text: String,
    timestamp: Date
  }],
  keyQuotes: [{
    speaker: String,
    text: String,
    timestamp: Date
  }],
  // Meeting metadata
  duration: {
    type: Number,
    default: 0 // in seconds
  },
  meetingDate: {
    type: Date,
    default: Date.now
  },
  meetingType: {
    type: String,
    enum: ['standup', 'brainstorm', 'one-on-one', 'planning', 'retrospective', 'general'],
    default: 'general'
  },
  attendees: [String],
  tags: [String],
  starred: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search
meetingTranscriptSchema.index({ title: 'text', transcript: 'text', tags: 'text' });

module.exports = mongoose.model('MeetingTranscript', meetingTranscriptSchema);
