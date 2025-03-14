const mongoose = require('mongoose');

const WorkbookSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apis: Object,
  apiType: String,
  requirements: Object,
  architecture: Object,
  diagram: Object,
  lastModified: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workbook', WorkbookSchema);