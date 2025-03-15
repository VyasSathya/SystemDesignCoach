require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function testConnection() {
    try {
        console.log('Attempting to connect with URI:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB!');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

testConnection();