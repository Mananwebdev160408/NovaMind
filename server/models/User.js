const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    name: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    occupation: {
      type: String,
      default: ''
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'oled'],
      default: 'dark'
    },
    defaultLanguage: {
      type: String,
      default: 'en'
    },
    writingMode: {
      type: String,
      enum: ['email', 'document', 'blog', 'creative'],
      default: 'document'
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    enableNotifications: {
      type: Boolean,
      default: true
    },
    enableEncryption: {
      type: Boolean,
      default: false
    },
    keyboardShortcuts: {
      type: Map,
      of: String,
      default: {}
    }
  },
  stats: {
    totalWords: {
      type: Number,
      default: 0
    },
    totalDocuments: {
      type: Number,
      default: 0
    },
    totalNotes: {
      type: Number,
      default: 0
    },
    totalMeetings: {
      type: Number,
      default: 0
    },
    totalCodeSnippets: {
      type: Number,
      default: 0
    },
    practiceStreak: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
