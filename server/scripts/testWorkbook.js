const mongoose = require('mongoose');
const Workbook = require('../models/Workbook');

async function createTestWorkbook() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://vyassathya:SanD%21eg0@system-design-db.24esv.mongodb.net/systemdesigncoach";
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const testWorkbook = new Workbook({
      sessionId: 'test-session-' + Date.now(),
      userId: new mongoose.Types.ObjectId(), // This creates a new ObjectId
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
    console.log('Test workbook created:', JSON.stringify(savedWorkbook, null, 2));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestWorkbook();