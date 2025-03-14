const mongoose = require('mongoose');

const DiagramSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  workbookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workbook',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  content: {
    nodes: [mongoose.Schema.Types.Mixed],
    edges: [mongoose.Schema.Types.Mixed]
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

DiagramSchema.index({ sessionId: 1 }, { name: 'diagram_session_id' });
DiagramSchema.index({ workbookId: 1 }, { name: 'diagram_workbook_id' });

const Diagram = mongoose.model('Diagram', DiagramSchema);
module.exports = Diagram;
