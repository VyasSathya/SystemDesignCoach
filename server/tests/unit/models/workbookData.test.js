import mongoose from 'mongoose';
import { WorkbookData } from '../../../models/WorkbookData';

describe('WorkbookData Model', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await WorkbookData.deleteMany({});
  });

  test('should store section data correctly', async () => {
    const testData = {
      userId: new mongoose.Types.ObjectId().toString(),
      problemId: 'test-problem',
      sections: {
        requirements: { content: 'test content' }
      }
    };

    const workbook = new WorkbookData(testData);
    await workbook.save();

    const savedWorkbook = await WorkbookData.findOne({ userId: testData.userId });
    expect(savedWorkbook.sections.requirements.content).toBe('test content');
  }, 15000);

  test('should handle diagram data', async () => {
    const testData = {
      userId: new mongoose.Types.ObjectId().toString(),
      problemId: 'test-problem',
      diagrams: new Map([
        ['architecture', {
          nodes: [],
          edges: []
        }]
      ])
    };

    const workbook = new WorkbookData(testData);
    await workbook.save();

    const savedWorkbook = await WorkbookData.findOne({ userId: testData.userId });
    expect(savedWorkbook.diagrams.get('architecture')).toBeDefined();
  }, 15000);
});


