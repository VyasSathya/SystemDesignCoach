const mongoose = require('mongoose');

const workbookDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  problemId: { type: String, required: true },
  sections: {
    requirements: { type: mongoose.Schema.Types.Mixed },
    architecture: { type: mongoose.Schema.Types.Mixed },
    api: { type: mongoose.Schema.Types.Mixed }
  },
  diagrams: {
    type: Map,
    of: Object
  },
  lastModified: { type: Date, default: Date.now }
});

const WorkbookData = mongoose.model('WorkbookData', workbookDataSchema);

module.exports = { WorkbookData };

