require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const Workbook = require('../models/Workbook');
const Problem = require('../models/Problem');
const Diagram = require('../models/Diagram');
const Evaluation = require('../models/Evaluation');
const logger = require('../utils/logger');

async function recreateIndexes() {
  const models = [User, Session, Workbook, Problem, Diagram, Evaluation];
  
  for (const Model of models) {
    const collection = Model.collection;
    try {
      // Drop existing indexes except _id
      const indexes = await collection.indexes();
      for (const index of indexes) {
        if (index.name !== '_id_') {
          await collection.dropIndex(index.name);
          logger.info(`Dropped index ${index.name} from ${collection.collectionName}`);
        }
      }
      
      // Recreate indexes from schema
      await Model.syncIndexes();
      logger.info(`Recreated indexes for ${collection.collectionName}`);
    } catch (error) {
      logger.warn(`Error handling indexes for ${collection.collectionName}:`, error);
    }
  }
}

async function initializeDatabase() {
  try {
    // Verify MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Recreate indexes
    await recreateIndexes();
    logger.info('Indexes have been recreated');

    // Create collections if they don't exist
    const collections = [
      'users',
      'sessions',
      'workbooks',
      'problems',
      'diagrams',
      'evaluations'
    ];

    for (const collectionName of collections) {
      if (!(await mongoose.connection.db.listCollections({ name: collectionName }).hasNext())) {
        await mongoose.connection.db.createCollection(collectionName);
        logger.info(`Created collection: ${collectionName}`);
      }
    }

    // Create default admin user if it doesn't exist
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        experience: 'expert'
      });
      logger.info('Created admin user');
    }

    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}
module.exports = initializeDatabase;
