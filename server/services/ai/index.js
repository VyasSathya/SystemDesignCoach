const claudeService = require('./claudeService');

/**
 * Factory function to get the appropriate AI service
 */
function getAIService(serviceType) {
  switch(serviceType) {
    case 'claude':
    default:
      return claudeService;
  }
}

module.exports = { getAIService };