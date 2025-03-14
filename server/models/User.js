const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // This will create the index automatically
  },
  password: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    default: 'beginner'
  }
}, {
  timestamps: true
});

// Remove explicit index definition since we're using unique: true in the schema
// UserSchema.index({ email: 1 }, { unique: true, name: 'user_email_unique' });

const User = mongoose.model('User', UserSchema);
module.exports = User;
