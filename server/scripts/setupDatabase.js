// server/scripts/setupDatabase.js
const mongoose = require('mongoose');
const User = require('../models/User');

async function setupDatabase() {
  try {
    // Hardcoded MongoDB URI - replace with your actual MongoDB URI
    const mongoUri = "mongodb+srv://vyassathya:SanD%21eg0@system-design-db.24esv.mongodb.net/systemdesigncoach?retryWrites=true&w=majority";
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Check if the admin user exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      // Create an admin user
      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword', // Will be hashed by pre-save hook
        experience: 'expert'
      });
      
      await admin.save();
      console.log('Created admin user');
    } else {
      console.log('Admin user already exists');
    }
    
    // List collections and counts
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Database setup completed');
  } catch (error) {
    console.error('Error setting up database:', error);
    console.error(error.stack);
  }
}

setupDatabase();