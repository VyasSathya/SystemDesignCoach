const mongoose = require('mongoose');

async function checkConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri);
    
    console.log('Connection successful!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:', collections.map(c => c.name));
    
    await mongoose.connection.db.admin().serverStatus();
    console.log('Server status check passed');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Connection error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    process.exit(1);
  }
}

module.exports = checkConnection;
