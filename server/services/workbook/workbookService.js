const WorkbookData = require('../../models/WorkbookData');
const logger = require('../../utils/logger');

class WorkbookService {
  async getWorkbook(userId, problemId) {
    try {
      let workbook = await WorkbookData.findOne({ userId, problemId });
      
      if (!workbook) {
        // Initialize new workbook if none exists
        workbook = await WorkbookData.create({
          userId,
          problemId,
          diagrams: {
            system: { nodes: [], edges: [], mermaidCode: '' },
            sequence: { nodes: [], edges: [], mermaidCode: '' }
          },
          chat: [],
          sections: {
            requirements: {},
            api: {},
            data: {},
            architecture: {},
            scaling: {},
            reliability: {}
          }
        });
      }

      return workbook;
    } catch (error) {
      logger.error('Error getting workbook:', error);
      throw error;
    }
  }

  async saveDiagram(userId, problemId, diagramData, type) {
    try {
      const update = {
        [`diagrams.${type}`]: {
          ...diagramData,
          lastUpdated: new Date()
        },
        lastSynced: new Date()
      };

      const workbook = await WorkbookData.findOneAndUpdate(
        { userId, problemId },
        { $set: update },
        { new: true, upsert: true }
      );

      return workbook.diagrams[type];
    } catch (error) {
      logger.error(`Error saving ${type} diagram:`, error);
      throw error;
    }
  }

  async getDiagram(userId, problemId, type) {
    try {
      const workbook = await WorkbookData.findOne({ userId, problemId });
      return workbook?.diagrams?.[type] || null;
    } catch (error) {
      logger.error(`Error getting ${type} diagram:`, error);
      throw error;
    }
  }

  async saveChat(userId, problemId, messages) {
    try {
      const workbook = await WorkbookData.findOneAndUpdate(
        { userId, problemId },
        {
          $set: {
            chat: messages,
            lastSynced: new Date()
          }
        },
        { new: true, upsert: true }
      );

      return workbook.chat;
    } catch (error) {
      logger.error('Error saving chat:', error);
      throw error;
    }
  }

  async saveProgress(userId, problemId, sectionData) {
    try {
      const workbook = await WorkbookData.findOneAndUpdate(
        { userId, problemId },
        {
          $set: {
            sections: sectionData,
            lastSynced: new Date()
          }
        },
        { new: true, upsert: true }
      );

      return workbook.sections;
    } catch (error) {
      logger.error('Error saving progress:', error);
      throw error;
    }
  }
}

module.exports = new WorkbookService();
