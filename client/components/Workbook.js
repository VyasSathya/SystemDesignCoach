import { useState, useEffect } from 'react';
import { autoSaveWorkbook } from '../utils/workbookStorage';
import { CheckCircle, AlertCircle } from 'react-feather';

const Workbook = ({ sessionId, userId, initialData }) => {
  const [saveStatus, setSaveStatus] = useState('idle');
  const [workbookData, setWorkbookData] = useState(initialData);

  const handleWorkbookChange = async (newData) => {
    console.log('Workbook changed:', newData);
    setWorkbookData(newData);
    try {
      await autoSaveWorkbook(sessionId, newData, userId, (status) => {
        console.log('Save status:', status);
        setSaveStatus(status);
      });
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
    }
  };

  const handleManualSave = async () => {
    console.log('Manual save triggered');
    setSaveStatus('saving');
    try {
      await autoSaveWorkbook(sessionId, workbookData, userId, setSaveStatus);
      console.log('Manual save completed');
    } catch (error) {
      console.error('Manual save error:', error);
      setSaveStatus('error');
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('Current save status:', saveStatus);
  }, [saveStatus]);

  return (
    <div>
      <div className="fixed bottom-4 right-4 z-50">
        {saveStatus === 'saving' && (
          <div className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <CheckCircle className="h-4 w-4 mr-2" />
            Saved
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <AlertCircle className="h-4 w-4 mr-2" />
            Save failed
          </div>
        )}
      </div>

      <button
        onClick={handleManualSave}
        disabled={saveStatus === 'saving'}
        className={`fixed bottom-4 left-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center ${
          saveStatus === 'saving' 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {saveStatus === 'saving' ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save
          </>
        )}
      </button>

      {/* Your existing workbook content */}
    </div>
  );
};

export default Workbook;
