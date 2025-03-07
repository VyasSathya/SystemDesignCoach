const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'senior', 'expert'],
    default: 'intermediate'
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  preferredProblems: {
    type: [String],
    default: []
  },
  progress: {
    problemsCompleted: {
      type: Number,
      default: 0
    },
    problemsAttempted: {
      type: Number,
      default: 0
    },
    timeInvested: {
      type: Number,
      default: 0
    },
    avgScore: {
      type: Number,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      best: {
        type: Number,
        default: 0
      },
      lastActivity: {
        type: Date
      }
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    }
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.progress.streak.lastActivity;
  
  if (!lastActivity) {
    // First activity
    this.progress.streak.current = 1;
    this.progress.streak.best = 1;
  } else {
    const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastActivity === 0) {
      // Already counted today
      return;
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day
      this.progress.streak.current += 1;
      
      // Update best streak if needed
      if (this.progress.streak.current > this.progress.streak.best) {
        this.progress.streak.best = this.progress.streak.current;
      }
    } else {
      // Streak broken
      this.progress.streak.current = 1;
    }
  }
  
  this.progress.streak.lastActivity = now;
};

// Method to update progress stats
userSchema.methods.updateProgress = async function(session) {
  // Update time invested
  this.progress.timeInvested += session.timeSpent / 60; // Convert minutes to hours
  
  if (!session.completed) {
    // Just update streak and time
    this.updateStreak();
    return;
  }
  
  // Completed problem
  this.progress.problemsCompleted += 1;
  
  // Update average score
  const oldTotal = this.progress.avgScore * (this.progress.problemsCompleted - 1);
  this.progress.avgScore = (oldTotal + session.score) / this.progress.problemsCompleted;
  
  // Update streak
  this.updateStreak();
};

const User = mongoose.model('User', userSchema);

module.exports = User;