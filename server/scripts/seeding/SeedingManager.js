const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const { ProblemSeeder } = require('./seeders/ProblemSeeder');
const { UserSeeder } = require('./seeders/UserSeeder');
const { WorkbookSeeder } = require('./seeders/WorkbookSeeder');
const { SchemaValidator } = require('./validators/SchemaValidator');
const { RelationshipValidator } = require('./validators/RelationshipValidator');

class SeedingManager {
  constructor(config) {
    this.config = config;
    this.seeders = {
      problems: new ProblemSeeder(),
      users: new UserSeeder(),
      workbooks: new WorkbookSeeder()
    };
    this.validators = {
      schema: new SchemaValidator(),
      relations: new RelationshipValidator()
    };
  }

  async initialize() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('Connected to MongoDB');
      await this.validateConfig();
    } catch (error) {
      logger.error('Initialization failed:', error);
      throw error;
    }
  }

  async validateConfig() {
    const { environment, seedingMode, dataSources } = this.config;
    if (!['development', 'staging', 'production'].includes(environment)) {
      throw new Error(`Invalid environment: ${environment}`);
    }
    if (!['full', 'partial', 'reset'].includes(seedingMode)) {
      throw new Error(`Invalid seeding mode: ${seedingMode}`);
    }
    if (!dataSources || !dataSources.problems || !dataSources.templates) {
      throw new Error('Invalid data source configuration');
    }
  }

  async runMigrations() {
    logger.info('Running pre-seed migrations...');
    // Add migration logic here
  }

  async seedData() {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Seed in specific order to maintain relationships
      await this.seeders.users.seed(this.config, session);
      await this.seeders.problems.seed(this.config, session);
      await this.seeders.workbooks.seed(this.config, session);

      await this.verifySeeding(session);
      await session.commitTransaction();
      logger.info('Seeding completed successfully');
    } catch (error) {
      await session.abortTransaction();
      logger.error('Seeding failed:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async verifySeeding(session) {
    logger.info('Verifying seeded data...');
    await this.validators.schema.validate(session);
    await this.validators.relations.validate(session);
  }
}

module.exports = { SeedingManager };