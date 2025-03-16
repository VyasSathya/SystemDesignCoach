require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const problems = require('./seedData/problems');
const logger = require('../utils/logger');

async function seedProblems() {
  try {
    // Clear existing problems
    await Problem.deleteMany({});
    logger.info('Cleared existing problems');

    // Insert new problems
    const result = await Problem.insertMany(problems);
    logger.info(`Seeded ${result.length} problems`);

    return result;
  } catch (error) {
    logger.error('Error seeding problems:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    await seedProblems();
    logger.info('Database seeding completed');

    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;