const mongoose = require('mongoose');
const Workbook = require('../models/Workbook');

async function checkDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Check workbooks
    const workbooks = await Workbook.find({}).limit(5);
    console.log('\nRecent Workbooks:');
    console.log(JSON.stringify(workbooks, null, 2));
    
    // Get collection count
    const count = await Workbook.countDocuments();
    console.log('\nCollection Stats:');
    console.log(`Total documents: ${count}`);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable Collections:');
    console.log(collections.map(c => c.name));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();