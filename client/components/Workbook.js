import RealTimeFeedback from './RealTimeFeedback';
import { ReviewButton } from './ReviewButton';
import { useState, useEffect } from 'react';
import { autoSaveWorkbook } from '../utils/workbookStorage';

const Workbook = ({ sessionId, userId, initialData }) => {
  const [currentSection, setCurrentSection] = useState('requirements');
  const [workbookData, setWorkbookData] = useState(initialData);
  const [evaluations, setEvaluations] = useState({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastVersionTime, setLastVersionTime] = useState(new Date().toLocaleString());

  const handleSectionChange = async (section, content) => {
    const newData = {
      ...workbookData,
      [section]: content
    };
    setWorkbookData(newData);

    try {
      setSaveStatus('saving');
      await autoSaveWorkbook(sessionId, newData);
      setSaveStatus('saved');
      setLastVersionTime(new Date().toLocaleString());
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    }
  };

  const handleReview = async (sectionId) => {
    setIsReviewing(true);
    try {
      const sectionData = workbookData[sectionId];
      const diagramData = sectionId === 'diagram' ? {
        nodes: workbookData.diagram.nodes,
        edges: workbookData.diagram.edges,
        type: workbookData.diagram.type
      } : null;

      const response = await fetch(`/api/sessions/${sessionId}/review/${sectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionData,
          diagramData
        })
      });

      const { review } = await response.json();
      
      setEvaluations(prev => ({
        ...prev,
        [sectionId]: review
      }));
    } catch (error) {
      console.error('Review error:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="workbook-container">
      {/* Save Status */}
      <div className="save-status">
        {saveStatus === 'saving' && <span>Saving...</span>}
        {saveStatus === 'saved' && <span>All changes saved</span>}
        {saveStatus === 'error' && (
          <span className="error">
            Save failed - Working offline
          </span>
        )}
      </div>

      {/* Version Info */}
      <div className="version-info">
        Last checkpoint: {lastVersionTime}
      </div>

      {/* Main Content */}
      <div className="workbook-content">
        <textarea
          value={workbookData[currentSection]}
          onChange={(e) => handleSectionChange(currentSection, e.target.value)}
        />
      </div>
    </div>
  );
};

export default Workbook;
