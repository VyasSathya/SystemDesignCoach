import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, MessageSquare, Save, Check, Clock, PenTool } from 'lucide-react';
import WorkbookPageWrapper from './WorkbookPageWrapper';
import DiagramPanel from '../components/diagram/DiagramPanel';
import { toast } from 'react-toastify';
import { useSession } from '../hooks/useSession';

const EnhancedRequirementsPage = ({ data = {}, updateData }) => {
  const [functionalReqs, setFunctionalReqs] = useState(
    data.functionalReqs ? JSON.parse(data.functionalReqs) : [
      { id: 1, text: '', completed: false }
    ]
  );
  
  const [nonFunctionalReqs, setNonFunctionalReqs] = useState(
    data.nonFunctionalReqs ? JSON.parse(data.nonFunctionalReqs) : [
      { id: 1, category: 'Performance', text: '' },
      { id: 2, category: 'Scalability', text: '' },
      { id: 3, category: 'Reliability', text: '' },
      { id: 4, category: 'Security', text: '' }
    ]
  );
  
  const [constraints, setConstraints] = useState(data.constraints || '');
  const [assumptions, setAssumptions] = useState(data.assumptions || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showDiagramPanel, setShowDiagramPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const { sessionId, sessionType } = useSession();
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      if (hasUnsavedChanges()) {
        await handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds if there are changes

    return () => clearTimeout(saveTimer);
  }, [functionalReqs, nonFunctionalReqs, constraints, assumptions]);

  const hasUnsavedChanges = useCallback(() => {
    // Implementation of unsaved changes detection
    return false;
  }, [functionalReqs, nonFunctionalReqs]);

  const handleAutoSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      const formattedData = {
        functionalReqs: JSON.stringify(functionalReqs),
        nonFunctionalReqs: JSON.stringify(nonFunctionalReqs),
        constraints,
        assumptions,
        lastUpdated: new Date().toISOString()
      };

      await updateData(formattedData);
      setLastSaved(new Date());
      toast({
        title: "Progress Saved",
        description: "Your changes have been automatically saved",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Auto-save Failed",
        description: "Changes couldn't be saved automatically. Please save manually.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFunctionalReq = () => {
    const newId = Math.max(...functionalReqs.map(req => req.id), 0) + 1;
    setFunctionalReqs([...functionalReqs, { id: newId, text: '', completed: false }]);
  };

  const handleAddNonFunctionalReq = () => {
    const newId = Math.max(...nonFunctionalReqs.map(req => req.id), 0) + 1;
    setNonFunctionalReqs([...nonFunctionalReqs, { id: newId, category: 'Other', text: '' }]);
  };

  const handleDeleteReq = (index, type) => {
    if (type === 'functional') {
      setFunctionalReqs(functionalReqs.filter((_, i) => i !== index));
    } else {
      setNonFunctionalReqs(nonFunctionalReqs.filter((_, i) => i !== index));
    }
  };

  const handleDiagramOpen = () => setIsDiagramOpen(true);
  const handleDiagramClose = () => setIsDiagramOpen(false);

  const handleDiagramSave = async (diagramData) => {
    try {
      await updateData({
        ...data,
        diagrams: [...(data.diagrams || []), diagramData]
      });
      toast({
        title: "Diagram Saved",
        description: "Your diagram has been saved successfully",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save diagram",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAiSuggest = async () => {
    try {
      const response = await fetch('/api/ai/suggest-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionalReqs,
          nonFunctionalReqs,
          constraints,
          assumptions
        })
      });
      
      const suggestions = await response.json();
      setAiSuggestions(suggestions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI suggestions",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSaveAndContinue = async () => {
    // Validate all requirements
    const isValid = functionalReqs.some(req => req.text.trim().length > 0) &&
      nonFunctionalReqs.every(req => req.text.trim().length > 0) &&
      constraints.trim().length > 0 &&
      assumptions.trim().length > 0;

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before continuing",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Format data for saving
    const formattedData = {
      functionalReqs: JSON.stringify(functionalReqs),
      nonFunctionalReqs: JSON.stringify(nonFunctionalReqs),
      constraints,
      assumptions,
      lastUpdated: new Date().toISOString()
    };

    try {
      await updateData(formattedData);
      toast({
        title: "Progress Saved",
        description: "Moving to API Design section",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <WorkbookPageWrapper
      onSaveAndContinue={handleSaveAndContinue}
      isValid={functionalReqs.some(req => req.text.trim().length > 0)}
      nextSection="API Design"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Requirements Definition</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {isSaving && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 animate-spin" />
              Saving...
            </div>
          )}
          {lastSaved && !isSaving && (
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-1 text-green-500" />
              Last saved {new Date(lastSaved).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Coach tip box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 text-sm text-indigo-700">
            <strong className="font-medium">Coach tip:</strong> Start with clear user stories to identify key functional requirements. Define non-functional requirements with specific, measurable metrics.
          </div>
          
          {/* Functional Requirements */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Functional Requirements</h2>
              <button 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                onClick={() => {/* Add diagram functionality */}}
              >
                <PenTool size={14} className="mr-1" />
                Add diagram
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">What specific features and capabilities must the system provide?</p>
            
            <div className="space-y-2">
              {functionalReqs.map(req => (
                <div key={req.id} className="flex items-start gap-2">
                  <div className={`mt-1.5 rounded-md w-5 h-5 flex items-center justify-center border ${req.completed ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}
                    onClick={() => toggleFunctionalReq(req.id)}
                  >
                    {req.completed && <Check size={14} className="text-white" />}
                  </div>
                  <input
                    type="text"
                    value={req.text}
                    onChange={(e) => updateFunctionalReq(req.id, e.target.value)}
                    placeholder="Enter requirement..."
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                  <button 
                    onClick={() => handleDeleteReq(req.id, 'functional')}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleAddFunctionalReq}
              className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Plus size={16} className="mr-1" />
              Add Requirement
            </button>
          </div>
          
          {/* Non-Functional Requirements */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Non-Functional Requirements</h2>
            <p className="text-sm text-gray-600 mb-4">Quality attributes that define how the system should perform</p>
            
            <div className="space-y-3">
              {nonFunctionalReqs.map(req => (
                <div key={req.id} className="flex flex-col">
                  <label className="font-medium text-sm text-gray-700">{req.category}</label>
                  <input
                    type="text"
                    value={req.text}
                    onChange={(e) => updateNonFunctionalReq(req.id, e.target.value)}
                    placeholder={`Enter ${req.category.toLowerCase()} requirements...`}
                    className="p-2 border border-gray-300 rounded text-sm mt-1 w-full"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Constraints & Assumptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Constraints</h2>
              <p className="text-sm text-gray-600 mb-4">What limitations must be considered?</p>
              <textarea
                value={constraints}
                onChange={(e) => updateConstraints(e.target.value)}
                placeholder="Enter system constraints..."
                className="w-full h-32 p-2 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Assumptions</h2>
              <p className="text-sm text-gray-600 mb-4">What are you assuming about the system?</p>
              <textarea
                value={assumptions}
                onChange={(e) => updateAssumptions(e.target.value)}
                placeholder="Enter your assumptions..."
                className="w-full h-32 p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Enhanced footer with actions */}
        <div className="border-t border-gray-200 p-4 flex justify-between">
          <button className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
            <MessageSquare size={16} className="mr-2" />
            Ask Coach
          </button>
          <button className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
            <Save size={16} className="mr-2" />
            Save & Continue
          </button>
        </div>
      </div>
    </WorkbookPageWrapper>
  );
};

export default EnhancedRequirementsPage;