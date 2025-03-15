const Workbook = require('../../models/Workbook');
const Problem = require('../../models/Problem');
const logger = require('../../utils/logger');

class WorkbookService {
  async createWorkbook(userId, problemId) {
    try {
      const problem = await Problem.findOne({ id: problemId });
      if (!problem) {
        throw new Error('Problem not found');
      }

      const workbook = new Workbook({
        sessionId: `wb-${Date.now()}-${userId}`,
        userId,
        problemId,
        sections: this._initializeSections(problem)
      });

      await workbook.save();
      return workbook;
    } catch (error) {
      logger.error('Error creating workbook:', error);
      throw error;
    }
  }

  async getWorkbook(sessionId) {
    return Workbook.findOne({ sessionId });
  }

  async updateSection(sessionId, sectionPath, content) {
    try {
      const workbook = await this.getWorkbook(sessionId);
      if (!workbook) {
        throw new Error('Workbook not found');
      }

      // Update the specific section
      const section = this._getNestedSection(workbook.sections, sectionPath);
      if (!section) {
        throw new Error('Section not found');
      }

      section.content = content;
      section.status = 'in_progress';
      
      await workbook.save();
      return workbook;
    } catch (error) {
      logger.error('Error updating workbook section:', error);
      throw error;
    }
  }

  _initializeSections(problem) {
    return {
      requirements: {
        functional: {
          content: '',
          status: 'not_started'
        },
        nonFunctional: {
          content: '',
          status: 'not_started'
        }
      },
      api: {
        endpoints: {
          content: '',
          status: 'not_started'
        },
        documentation: {
          content: '',
          status: 'not_started'
        }
      },
      database: {
        schema: {
          content: '',
          status: 'not_started'
        },
        queries: {
          content: '',
          status: 'not_started'
        }
      },
      architecture: {
        highLevel: {
          content: '',
          status: 'not_started'
        },
        detailed: {
          content: '',
          status: 'not_started'
        }
      }
    };
  }

  _getNestedSection(sections, path) {
    return path.split('.').reduce((obj, key) => obj?.[key], sections);
  }
}

module.exports = new WorkbookService();