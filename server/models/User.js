const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  progress: {
    streak: {
      current: { type: Number, default: 0 },
      best: { type: Number, default: 0 }
    },
    problemsCompleted: { type: Number, default: 0 },
    problemsAttempted: { type: Number, default: 0 },
    timeInvested: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    strengths: [String],
    weaknesses: [String]
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
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
