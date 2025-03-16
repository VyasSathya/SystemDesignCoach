const mongoose = require('mongoose');
const User = require('../models/User');

async function setupDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
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

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

module.exports = setupDatabase;
