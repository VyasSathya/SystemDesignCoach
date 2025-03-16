require('dotenv').config();
const { SeedingManager } = require('./seeding/SeedingManager');
const logger = require('../utils/logger');

const config = {
  environment: process.env.NODE_ENV || 'development',
  seedingMode: 'full',
  dataSources: {
    problems: './data/problems/',
    templates: './data/templates/',
    examples: './data/examples/'
  },
  options: {
    validateRelations: true,
    clearExisting: true,
    createIndexes: true
  }
};

async function runSeeding() {
  const manager = new SeedingManager(config);
  
  try {
    await manager.initialize();
    await manager.runMigrations();
    await manager.seedData();
    
    logger.info('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeeding();
}