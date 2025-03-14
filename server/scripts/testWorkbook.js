const mongoose = require('mongoose');
const Workbook = require('../models/Workbook');

async function createTestWorkbook() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://vyassathya:SanD%21eg0@system-design-db.24esv.mongodb.net/systemdesigncoach";
    
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
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Attempting to save workbook...');
    const savedWorkbook = await testWorkbook.save();
    console.log('Workbook saved successfully:', JSON.stringify(savedWorkbook, null, 2));

    // Verify the save
    const found = await Workbook.findById(savedWorkbook._id);
    console.log('\nVerified workbook in database:', found ? 'Yes' : 'No');
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

createTestWorkbook();