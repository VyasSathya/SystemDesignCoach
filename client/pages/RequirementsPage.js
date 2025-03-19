import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, MessageSquare, Save, Check, Clock, PenTool } from 'lucide-react';
import WorkbookPageWrapper from './WorkbookPageWrapper';
import DiagramPanel from '../components/diagram/DiagramPanel';
import { toast } from 'react-toastify';
import { useSession } from '../hooks/useSession';

const RequirementsPage = ({ data = {}, updateData }) => {
  // Initialize state with default values
  const [functionalReqs, setFunctionalReqs] = useState(() => {
    try {
      return data.functionalReqs ? JSON.parse(data.functionalReqs) : [
        { id: 1, text: '', completed: false }
      ];
    } catch {
      return [{ id: 1, text: '', completed: false }];
    }
  });
  
  const [nonFunctionalReqs, setNonFunctionalReqs] = useState(() => {
    try {
      return data.nonFunctionalReqs ? JSON.parse(data.nonFunctionalReqs) : [
        { id: 1, category: 'Performance', text: '' },
        { id: 2, category: 'Scalability', text: '' },
        { id: 3, category: 'Security', text: '' }
      ];
    } catch {
      return [
        { id: 1, category: 'Performance', text: '' },
        { id: 2, category: 'Scalability', text: '' },
        { id: 3, category: 'Security', text: '' }
      ];
    }
  });

  const [constraints, setConstraints] = useState(data.constraints || '');
  const [assumptions, setAssumptions] = useState(data.assumptions || '');
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [showDiagramPanel, setShowDiagramPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const { sessionId, sessionType } = useSession();
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!data) return;
    
    try {
      if (data.functionalReqs) {
        setFunctionalReqs(JSON.parse(data.functionalReqs));
      }
      if (data.nonFunctionalReqs) {
        setNonFunctionalReqs(JSON.parse(data.nonFunctionalReqs));
      }
      if (data.constraints) {
        setConstraints(data.constraints);
      }
      if (data.assumptions) {
        setAssumptions(data.assumptions);
      }
    } catch (error) {
      console.error('Error parsing initial data:', error);
    }
  }, [data]);

  // Auto-save effect
  useEffect(() => {
    if (!hasLocalChanges || isSaving) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSaveStatus('saving');

        const formattedData = {
          functionalReqs: JSON.stringify(functionalReqs),
          nonFunctionalReqs: JSON.stringify(nonFunctionalReqs),
          constraints,
          assumptions,
          lastUpdated: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('requirements_backup', JSON.stringify(formattedData));

        if (updateData) {
          await updateData(formattedData);
        }

        setHasLocalChanges(false);
        setSaveStatus('saved');
      } catch (error) {
        console.error('Auto-save error:', error);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [hasLocalChanges, functionalReqs, nonFunctionalReqs, constraints, assumptions, updateData]);

  // Update handlers
  const updateFunctionalReq = useCallback((id, text) => {
    setFunctionalReqs(prev => prev.map(req =>
      req.id === id ? { ...req, text } : req
    ));
    setHasLocalChanges(true);
  }, []);

  const updateNonFunctionalReq = useCallback((id, text) => {
    setNonFunctionalReqs(prev => prev.map(req =>
      req.id === id ? { ...req, text } : req
    ));
    setHasLocalChanges(true);
  }, []);

  const handleConstraintsChange = useCallback((value) => {
    setConstraints(value);
    setHasLocalChanges(true);
  }, []);

  const handleAssumptionsChange = useCallback((value) => {
    setAssumptions(value);
    setHasLocalChanges(true);
  }, []);

  const toggleFunctionalReq = (id) => {
    const updatedReqs = functionalReqs.map(req =>
      req.id === id ? { ...req, completed: !req.completed } : req
    );
    setFunctionalReqs(updatedReqs);

    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        functionalReqs: JSON.stringify(updatedReqs)
      });
    }
  };

  const handleAddFunctionalReq = () => {
    const newId = Math.max(...functionalReqs.map(req => req.id), 0) + 1;
    const updatedReqs = [...functionalReqs, { id: newId, text: '', completed: false }];
    setFunctionalReqs(updatedReqs);
    setHasLocalChanges(true);
  };

  const handleAddNonFunctionalReq = () => {
    const newId = Math.max(...nonFunctionalReqs.map(req => req.id), 0) + 1;
    const updatedReqs = [...nonFunctionalReqs, { id: newId, category: 'Other', text: '' }];
    setNonFunctionalReqs(updatedReqs);
    setHasLocalChanges(true);
  };

  const handleDeleteReq = (id, type) => {
    if (type === 'functional') {
      const updatedReqs = functionalReqs.filter(req => req.id !== id);
      setFunctionalReqs(updatedReqs);
    } else {
      const updatedReqs = nonFunctionalReqs.filter(req => req.id !== id);
      setNonFunctionalReqs(updatedReqs);
    }
    setHasLocalChanges(true);
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-6">
        {/* Coach tip box */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 text-sm text-indigo-700">
          <strong className="font-medium">Coach tip:</strong> Start with clear user stories to identify key functional requirements. Define non-functional requirements with specific, measurable metrics.
        </div>
        
        {/* Functional Requirements */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Functional Requirements</h2>
            <button 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              onClick={handleDiagramOpen}
            >
              <PenTool size={14} className="mr-1" />
              Add diagram
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">What specific features and capabilities must the system provide?</p>
          
          <div className="space-y-2">
            {functionalReqs.map(req => (
              <div key={req.id} className="flex items-start gap-2">
                <div 
                  className={`mt-1.5 rounded-md w-5 h-5 flex items-center justify-center border cursor-pointer ${req.completed ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}
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
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Non-Functional Requirements</h2>
          <p className="text-sm text-gray-600 mb-4">Quality attributes that define how the system should perform</p>
          
          <div className="space-y-3">
            {nonFunctionalReqs.map(req => (
              <div key={req.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="font-medium text-sm text-gray-700">{req.category}</label>
                  <input
                    type="text"
                    value={req.text}
                    onChange={(e) => updateNonFunctionalReq(req.id, e.target.value)}
                    placeholder={`Enter ${req.category.toLowerCase()} requirements...`}
                    className="w-full p-2 border border-gray-300 rounded text-sm mt-1"
                  />
                </div>
                <button 
                  onClick={() => handleDeleteReq(req.id, 'non-functional')}
                  className="p-1 mt-6 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleAddNonFunctionalReq}
            className="mt-3 flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Plus size={16} className="mr-1" />
            Add Requirement
          </button>
        </div>
        
        {/* Constraints & Assumptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Constraints</h2>
            <p className="text-sm text-gray-600 mb-4">What limitations must be considered?</p>
            <textarea
              value={constraints}
              onChange={(e) => handleConstraintsChange(e.target.value)}
              placeholder="Enter system constraints..."
              className="w-full h-32 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Assumptions</h2>
            <p className="text-sm text-gray-600 mb-4">What assumptions are being made?</p>
            <textarea
              value={assumptions}
              onChange={(e) => handleAssumptionsChange(e.target.value)}
              placeholder="Enter system assumptions..."
              className="w-full h-32 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsPage;
