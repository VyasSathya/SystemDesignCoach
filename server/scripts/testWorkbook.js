const mongoose = require('mongoose');
const Workbook = require('../models/Workbook');

async function createTestWorkbook() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Create test data
    const testWorkbook = new Workbook({
      sessionId: 'test-session-' + Date.now(),
      userId: new mongoose.Types.ObjectId(),
      title: "Test Workbook",
      description: "This is a test workbook",
      apis: {
        endpoint: '/api/test',
        method: 'GET'
      },
      apiType: 'REST',
      requirements: {
        functional: ['Test requirement 1', 'Test requirement 2'],
        nonFunctional: ['Performance', 'Security']
      },
      architecture: {
        components: ['Frontend', 'Backend', 'Database']
      },
      diagram: {
        nodes: [],
        edges: []
      }
    });
    
    await testWorkbook.save();
    console.log('Test workbook created');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestWorkbook();