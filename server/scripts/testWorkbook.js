const mongoose = require('mongoose');
const Workbook = require('../models/Workbook');
require('dotenv').config();

async function createTestWorkbook() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Attempting to connect with URI:', mongoUri ? 'URI found' : 'URI missing');
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Create test data
    const testWorkbook = new Workbook({
      sessionId: 'test-session-' + Date.now(),
      userId: new mongoose.Types.ObjectId(),
      problemId: new mongoose.Types.ObjectId(),
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
    
    const savedWorkbook = await testWorkbook.save();
    console.log('Test workbook created with ID:', savedWorkbook._id);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestWorkbook();