import RealTimeFeedback from './RealTimeFeedback';
import { useState, useEffect } from 'react';
import { autoSaveWorkbook } from '../utils/workbookStorage';

const Workbook = ({ sessionId, userId, initialData }) => {
  const [currentSection, setCurrentSection] = useState('requirements');
  const [workbookData, setWorkbookData] = useState(initialData);
  const [evaluations, setEvaluations] = useState({});

  const handleSectionChange = async (section, content) => {
    const newData = {
      ...workbookData,
      [section]: content
    };
    setWorkbookData(newData);

    try {
      await autoSaveWorkbook(sessionId, newData);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleFeedback = (section, feedback) => {
    setEvaluations(prev => ({
      ...prev,
      [section]: feedback
    }));
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4">
        <WorkbookSection
          section={currentSection}
          content={workbookData[currentSection]}
          onChange={(content) => handleSectionChange(currentSection, content)}
        />
        
        <RealTimeFeedback
          section={currentSection}
          content={workbookData[currentSection]}
          onFeedback={(feedback) => handleFeedback(currentSection, feedback)}
        />
      </div>

      <div className="w-64 bg-gray-100 p-4">
        <ProgressSidebar
          evaluations={evaluations}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        />
      </div>
    </div>
  );
};

export default Workbook;
