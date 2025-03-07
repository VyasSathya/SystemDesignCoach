// server/models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      stage: Number
    }
  }],
  currentStage: {
    type: Number,
    default: 0
  },
  diagram: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number
  },
  feedback: {
    type: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number,
    default: 0
  }
});

// Virtual for progress percentage
sessionSchema.virtual('percentComplete').get(function() {
  // Get the associated problem to determine total stages
  // This is a simplified version - in production you'd want to fetch the problem data
  const totalStages = 6; // Assuming 6 stages per problem
  return Math.round((this.currentStage / totalStages) * 100);
});

// Update lastUpdatedAt and calculate timeSpent on save
sessionSchema.pre('save', function(next) {
  const now = Date.now();
  
  if (this.lastUpdatedAt) {
    // Add time diff to timeSpent (in minutes)
    const diffMs = now - this.lastUpdatedAt;
    const diffMinutes = Math.round(diffMs / 60000);
    
    // Only count if less than 30 minutes (assume user was away if longer)
    if (diffMinutes < 30) {
      this.timeSpent += diffMinutes;
    }
  }
  
  this.lastUpdatedAt = now;
  
  if (this.completed && !this.completedAt) {
    this.completedAt = now;
  }
  
  next();
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;