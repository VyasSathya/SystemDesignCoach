const mongoose = require('mongoose');
const logger = require('./logger');

class DatabaseHealthCheck {
  static async checkConnection() {
    try {
      const state = mongoose.connection.readyState;
      switch (state) {
        case 0:
          throw new Error('MongoDB disconnected');
        case 1:
          return true;
        case 2:
          logger.warn('MongoDB connecting');
          return true;
        case 3:
          throw new Error('MongoDB disconnecting');
        default:
          throw new Error('Unknown MongoDB state');
      }
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  static async ping() {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('Database ping failed:', error);
      return false;
    }
  }
}

module.exports = DatabaseHealthCheck;