import { workbookService } from '../../../server/services/workbook/workbookService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, userId, problemId, data, subType } = req.body;
    
    console.log('API Route: Processing sync request:', {
      type,
      userId,
      problemId,
      subType,
      hasData: !!data
    });

    let result;
    switch (type) {
      case 'diagram':
        result = await workbookService.saveDiagram(
          userId,
          problemId,
          subType,
          data
        );
        break;
      case 'chat':
        result = await workbookService.saveChat(
          userId,
          problemId,
          data
        );
        break;
      case 'progress':
        result = await workbookService.saveProgress(
          userId,
          problemId,
          data
        );
        break;
      default:
        throw new Error(`Invalid sync type: ${type}`);
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('API Route: Sync error:', error);
    return res.status(500).json({ error: error.message });
  }
}