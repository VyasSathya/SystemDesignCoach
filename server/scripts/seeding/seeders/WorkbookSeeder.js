const Workbook = require('../../../models/Workbook');
const logger = require('../../../utils/logger');

class WorkbookSeeder {
  constructor() {
    this.sampleWorkbooks = [
      {
        // Will be populated with actual user and problem IDs during seeding
        title: 'Twitter System Design',
        status: 'in_progress',
        progress: {
          currentStage: 'requirements',
          completedStages: ['introduction'],
          timeSpent: 45, // minutes
          lastUpdated: new Date()
        },
        requirements: {
          functional: [
            'Users can post tweets',
            'Users can follow other users',
            'Users can view their timeline'
          ],
          nonFunctional: [
            'System should handle 100K tweets per second',
            'Timeline loading should be under 200ms',
            'System should be highly available'
          ]
        },
        diagrams: [
          {
            type: 'system',
            nodes: [
              { id: 'client1', type: 'client', position: { x: 100, y: 100 }, data: { label: 'Mobile Client' } },
              { id: 'service1', type: 'service', position: { x: 300, y: 100 }, data: { label: 'Auth Service' } },
              { id: 'database1', type: 'database', position: { x: 500, y: 100 }, data: { label: 'User DB' } },
              { id: 'loadBalancer1', type: 'loadBalancer', position: { x: 200, y: 200 }, data: { label: 'API LB' } },
              { id: 'cache1', type: 'cache', position: { x: 400, y: 200 }, data: { label: 'Redis Cache' } },
              { id: 'queue1', type: 'queue', position: { x: 600, y: 200 }, data: { label: 'Message Queue' } },
              { id: 'gateway1', type: 'gateway', position: { x: 300, y: 300 }, data: { label: 'API Gateway' } },
              { id: 'network1', type: 'network', position: { x: 500, y: 300 }, data: { label: 'CDN' } }
            ],
            edges: [
              { id: 'e1', source: 'client1', target: 'gateway1' },
              { id: 'e2', source: 'gateway1', target: 'loadBalancer1' },
              { id: 'e3', source: 'loadBalancer1', target: 'service1' },
              { id: 'e4', source: 'service1', target: 'database1' },
              { id: 'e5', source: 'service1', target: 'cache1' },
              { id: 'e6', source: 'service1', target: 'queue1' }
            ]
          },
          {
            type: 'sequence',
            participants: [
              { id: 'user1', type: 'user', data: { label: 'User' } },
              { id: 'service1', type: 'service', data: { label: 'Auth Service' } },
              { id: 'database1', type: 'database', data: { label: 'Database' } },
              { id: 'external1', type: 'external', data: { label: 'Payment API' } },
              { id: 'queue1', type: 'queue', data: { label: 'Notification Queue' } },
              { id: 'component1', type: 'component', data: { label: 'Email Service' } }
            ],
            messages: [
              { 
                id: 'm1', 
                from: 'user1', 
                to: 'service1', 
                type: 'sync', 
                label: 'Login Request' 
              },
              { 
                id: 'm2', 
                from: 'service1', 
                to: 'database1', 
                type: 'async', 
                label: 'Verify Credentials' 
              },
              { 
                id: 'm3', 
                from: 'database1', 
                to: 'service1', 
                type: 'callback', 
                label: 'User Verified' 
              }
            ],
            fragments: [
              {
                type: 'loop',
                label: 'Retry Logic',
                participants: ['service1', 'database1'],
                messages: ['m2', 'm3']
              },
              {
                type: 'alt',
                label: 'Authentication Result',
                participants: ['service1', 'user1'],
                messages: ['m3']
              }
            ]
          }
        ],
        feedback: [
          {
            stage: 'requirements',
            content: 'Good start on the requirements. Consider adding rate limiting requirements.',
            timestamp: new Date(),
            type: 'suggestion'
          }
        ]
      }
    ];
  }

  async seed(config, session) {
    try {
      if (config.options.clearExisting) {
        await Workbook.deleteMany({}, { session });
        logger.info('Cleared existing workbooks');
      }

      // Get the first problem and user for sample workbooks
      const Problem = require('../../../models/Problem');
      const User = require('../../../models/User');

      const problem = await Problem.findOne({}, null, { session });
      const user = await User.findOne({ role: 'user' }, null, { session });

      if (!problem || !user) {
        throw new Error('Required problem or user not found. Ensure they are seeded first.');
      }

      // Populate the workbooks with actual IDs
      const workbooksWithIds = this.sampleWorkbooks.map(workbook => ({
        ...workbook,
        userId: user._id,
        problemId: problem._id
      }));

      const workbooks = await Workbook.insertMany(workbooksWithIds, { session });
      logger.info(`Seeded ${workbooks.length} workbooks`);

      // Create some progress entries
      await this.createProgressEntries(workbooks[0]._id, session);

      return workbooks;
    } catch (error) {
      logger.error('Workbook seeding failed:', error);
      throw error;
    }
  }

  async createProgressEntries(workbookId, session) {
    const Progress = require('../../../models/Progress');
    const progressEntries = [
      {
        workbookId,
        stage: 'introduction',
        status: 'completed',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        timeSpent: 15
      },
      {
        workbookId,
        stage: 'requirements',
        status: 'in_progress',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        timeSpent: 30
      }
    ];

    await Progress.insertMany(progressEntries, { session });
    logger.info(`Created ${progressEntries.length} progress entries for workbook ${workbookId}`);
  }
}

module.exports = { WorkbookSeeder };