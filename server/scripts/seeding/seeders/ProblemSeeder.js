const Problem = require('../../../models/Problem');
const logger = require('../../../utils/logger');

class ProblemSeeder {
  constructor() {
    this.sampleProblems = [
      {
        id: 'twitter-system-design',
        title: 'Design Twitter',
        difficulty: 'hard',
        category: 'distributed-systems',
        estimatedTime: 45,
        description: 'Design a simplified version of Twitter...',
        requirements: [
          'Tweet posting and timeline',
          'Follow/unfollow functionality',
          'News feed generation'
        ],
        constraints: {
          scale: '300M active users',
          storage: 'Tweets are mostly text',
          latency: 'Timeline loading < 200ms'
        },
        sampleSolution: {
          components: ['Load Balancer', 'App Servers', 'Cache Layer', 'Database'],
          diagram: `
            graph TD
              Client-->LB[Load Balancer]
              LB-->App[Application Servers]
              App-->Cache[Redis Cache]
              App-->DB[(Database)]
              App-->Queue[Message Queue]
          `
        }
      },
      // Add more sample problems here
    ];
  }

  async seed(config, session) {
    try {
      if (config.options.clearExisting) {
        await Problem.deleteMany({}, { session });
        logger.info('Cleared existing problems');
      }

      const problems = await Problem.insertMany(this.sampleProblems, { session });
      logger.info(`Seeded ${problems.length} problems`);

      return problems;
    } catch (error) {
      logger.error('Problem seeding failed:', error);
      throw error;
    }
  }
}

module.exports = { ProblemSeeder };