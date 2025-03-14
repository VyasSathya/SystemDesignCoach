import { autoSaveWorkbook } from '../utils/workbookStorage';

// In your component:
const handleWorkbookChange = (newData) => {
  setWorkbookData(newData);
  // This will automatically save after 3 seconds of no changes
  autoSaveWorkbook(sessionId, newData, userId);
};