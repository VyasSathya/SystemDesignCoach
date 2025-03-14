const mongoose = require('mongoose');

const WorkbookSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  content: mongoose.Schema.Types.Mixed,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

WorkbookSchema.index({ sessionId: 1 });
WorkbookSchema.index({ userId: 1 });

const Workbook = mongoose.model('Workbook', WorkbookSchema);
module.exports = Workbook;
