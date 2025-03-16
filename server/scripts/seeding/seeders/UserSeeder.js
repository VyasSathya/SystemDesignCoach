const User = require('../../../models/User');
const logger = require('../../../utils/logger');
const bcrypt = require('bcryptjs');

class UserSeeder {
  constructor() {
    this.sampleUsers = [
      {
        name: 'Admin User',
        email: 'admin@systemdesigncoach.com',
        password: 'admin123', // Will be hashed
        role: 'admin',
        experience: 'expert',
        preferences: {
          theme: 'dark',
          diagramStyle: 'detailed',
          feedbackFrequency: 'high'
        }
      },
      {
        name: 'Demo User',
        email: 'demo@systemdesigncoach.com',
        password: 'demo123', // Will be hashed
        role: 'user',
        experience: 'intermediate',
        preferences: {
          theme: 'light',
          diagramStyle: 'simple',
          feedbackFrequency: 'medium'
        }
      },
      {
        name: 'Test User',
        email: 'test@systemdesigncoach.com',
        password: 'test123', // Will be hashed
        role: 'user',
        experience: 'beginner',
        preferences: {
          theme: 'light',
          diagramStyle: 'simple',
          feedbackFrequency: 'high'
        }
      }
    ];
  }

  async seed(config, session) {
    try {
      if (config.options.clearExisting) {
        await User.deleteMany({}, { session });
        logger.info('Cleared existing users');
      }

      // Hash passwords before inserting
      const usersWithHashedPasswords = await Promise.all(
        this.sampleUsers.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10)
        }))
      );

      const users = await User.insertMany(usersWithHashedPasswords, { session });
      logger.info(`Seeded ${users.length} users`);

      // Store admin user ID for reference in other seeders
      const adminUser = users.find(u => u.role === 'admin');
      if (adminUser) {
        this.adminUserId = adminUser._id;
      }

      return users;
    } catch (error) {
      logger.error('User seeding failed:', error);
      throw error;
    }
  }

  getAdminUserId() {
    if (!this.adminUserId) {
      throw new Error('Admin user ID not available. Make sure seeding was successful.');
    }
    return this.adminUserId;
  }
}

module.exports = { UserSeeder };