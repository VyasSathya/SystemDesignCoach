require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Workbook = require('../models/Workbook');
const logger = require('../utils/logger');

async function verifyCollections() {
  const collections = await mongoose.connection.db.collections();
  const collectionNames = collections.map(c => c.collectionName);
  
  const requiredCollections = ['problems', 'workbooks', 'users', 'sessions'];
  const missing = requiredCollections.filter(name => !collectionNames.includes(name));
  
  if (missing.length > 0) {
    throw new Error(`Missing collections: ${missing.join(', ')}`);
  }
  
  return collectionNames;
}

async function verifyIndexes() {
  const models = [Problem, Workbook];
  const results = {};
  
  for (const Model of models) {
    const indexes = await Model.collection.indexes();
    results[Model.modelName] = indexes;
  }
  
  return results;
}

async function verifyData() {
  const problemCount = await Problem.countDocuments();
  if (problemCount === 0) {
    throw new Error('No problems found in database');
  }
  
  return {
    problems: problemCount
  };
}

async function verifyDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    const collections = await verifyCollections();
    logger.info('Collections verified:', collections);

    const indexes = await verifyIndexes();
    logger.info('Indexes verified:', indexes);

    const counts = await verifyData();
    logger.info('Data verified:', counts);

    await mongoose.disconnect();
    logger.info('Database verification completed successfully');
    
    return {
      collections,
      indexes,
      counts
    };
  } catch (error) {
    logger.error('Database verification failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  verifyDatabase();
}

module.exports = verifyDatabase;