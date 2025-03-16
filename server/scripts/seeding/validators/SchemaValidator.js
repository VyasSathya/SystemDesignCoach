const mongoose = require('mongoose');
const logger = require('../../../utils/logger');

class SchemaValidator {
  constructor() {
    this.validationRules = {
      problems: {
        required: ['id', 'title', 'difficulty'],
        unique: ['id'],
        types: {
          id: 'string',
          title: 'string',
          difficulty: ['easy', 'medium', 'hard']
        }
      },
      workbooks: {
        required: ['userId', 'problemId'],
        references: {
          userId: 'User',
          problemId: 'Problem'
        }
      }
    };
  }

  async validate(session) {
    logger.info('Validating schema integrity...');
    
    for (const [collection, rules] of Object.entries(this.validationRules)) {
      const Model = mongoose.model(collection);
      const documents = await Model.find({}, null, { session });

      for (const doc of documents) {
        await this.validateDocument(doc, rules);
      }
    }
  }

  async validateDocument(doc, rules) {
    // Check required fields
    for (const field of rules.required) {
      if (!doc[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check types
    if (rules.types) {
      for (const [field, type] of Object.entries(rules.types)) {
        if (doc[field] && !this.validateType(doc[field], type)) {
          throw new Error(`Invalid type for field: ${field}`);
        }
      }
    }

    // Additional validation logic can be added here
  }

  validateType(value, expectedType) {
    if (Array.isArray(expectedType)) {
      return expectedType.includes(value);
    }
    return typeof value === expectedType;
  }
}

module.exports = { SchemaValidator };