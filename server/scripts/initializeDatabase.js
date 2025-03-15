require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Workbook = require('../models/Workbook');
const logger = require('../utils/logger');
const problems = require('./seedData/problems');

async function recreateIndexes() {
  const models = [User, Problem, Workbook];
  
  for (const Model of models) {
    const collection = Model.collection;
    try {
      await Model.syncIndexes();
      logger.info(`Recreated indexes for ${collection.collectionName}`);
    } catch (error) {
      logger.error(`Error syncing indexes for ${collection.collectionName}:`, error);
    }
  }
}

async function seedInitialData() {
  // Create default admin if not exists
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

  // Load and seed problems from seedData
  await Problem.deleteMany({});
  await Problem.insertMany(problems);
  logger.info(`Seeded ${problems.length} problems`);
}

async function verifySetup() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  const requiredCollections = ['users', 'problems', 'workbooks'];
  
  for (const required of requiredCollections) {
    if (!collections.find(c => c.name === required)) {
      logger.error(`Missing required collection: ${required}`);
      throw new Error(`Missing required collection: ${required}`);
    }
  }
  
  logger.info('Database verification completed successfully');
}

async function initializeDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    await recreateIndexes();
    await seedInitialData();
    await verifySetup();

    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initializeDatabase;
