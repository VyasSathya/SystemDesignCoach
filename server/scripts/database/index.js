const initializeDatabase = require('./initialize');
const verifyDatabase = require('./verify');
const seedDatabase = require('./seed');

module.exports = {
  initialize: initializeDatabase,
  verify: verifyDatabase,
  seed: seedDatabase,
  
  // Utility function to run all database setup
  async setupComplete() {
    await initializeDatabase();
    await seedDatabase();
    return verifyDatabase();
  }
};