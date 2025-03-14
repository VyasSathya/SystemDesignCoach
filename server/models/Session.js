const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['interview', 'coaching'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date
}, {
  timestamps: true
});

SessionSchema.index({ userId: 1 }, { name: 'session_user_id' });
SessionSchema.index({ status: 1 }, { name: 'session_status' });

const Session = mongoose.model('Session', SessionSchema);
module.exports = Session;
