import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import { CheckCircle, AlertCircle, Save } from 'react-feather';
import RequirementSection from '../components/RequirementSection';

const RequirementsPage = ({ updateData, onSubmit }) => {
  // State management
  const [functionalReqs, setFunctionalReqs] = useState([]);
  const [nonFunctionalReqs, setNonFunctionalReqs] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [validationErrors, setValidationErrors] = useState([]);
  const [progress, setProgress] = useState({
    overall: 0,
    sections: {
      functional: 0,
      nonFunctional: 0,
      constraints: 0
    }
  });

  const handleSubmit = async () => {
    if (validationErrors.length > 0) {
      toast.error('Please fix all validation errors before submitting');
      return;
    }

    try {
      const requirementsData = {
        functionalReqs: JSON.stringify(functionalReqs),
        nonFunctionalReqs: JSON.stringify(nonFunctionalReqs),
        constraints: JSON.stringify(constraints)
      };

      if (onSubmit) {
        await onSubmit(requirementsData);
        toast.success('Requirements submitted successfully');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit requirements');
    }
  };

  // Load saved data
  useEffect(() => {
    try {
      const loadedFunctional = JSON.parse(localStorage.getItem('functionalReqs')) || [];
      const loadedNonFunctional = JSON.parse(localStorage.getItem('nonFunctionalReqs')) || [];
      const loadedConstraints = JSON.parse(localStorage.getItem('constraints')) || [];
      
      setFunctionalReqs(loadedFunctional);
      setNonFunctionalReqs(loadedNonFunctional);
      setConstraints(loadedConstraints);
    } catch (error) {
      console.error('Error loading saved data:', error);
      toast.error('Failed to load saved requirements');
    }
  }, []);

  // Auto-save handler
  const handleAutoSave = useCallback(
    debounce(async () => {
      try {
        setSaveStatus('saving');
        
        localStorage.setItem('functionalReqs', JSON.stringify(functionalReqs));
        localStorage.setItem('nonFunctionalReqs', JSON.stringify(nonFunctionalReqs));
        localStorage.setItem('constraints', JSON.stringify(constraints));
        
        if (updateData) {
          await updateData({
            functionalReqs: JSON.stringify(functionalReqs),
            nonFunctionalReqs: JSON.stringify(nonFunctionalReqs),
            constraints: JSON.stringify(constraints)
          });
        }
        
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setSaveStatus('error');
        toast.error('Failed to save changes');
      }
    }, 1000),
    [functionalReqs, nonFunctionalReqs, constraints, updateData]
  );

  // Validation logic
  const validateRequirements = useCallback(() => {
    const errors = [];
    
    if (functionalReqs.length < 3) {
      errors.push('Add at least 3 functional requirements');
    }
    
    if (nonFunctionalReqs.length < 2) {
      errors.push('Add at least 2 non-functional requirements');
    }
    
    if (constraints.length < 1) {
      errors.push('Add at least 1 constraint');
    }
    
    const invalidItems = [...functionalReqs, ...nonFunctionalReqs, ...constraints]
      .filter(item => !item.description || item.description.length < 10);
    
    if (invalidItems.length > 0) {
      errors.push('All requirements must have descriptions (min 10 characters)');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [functionalReqs, nonFunctionalReqs, constraints]);

  // Progress calculation
  const calculateProgress = useCallback(() => {
    const calculateSectionProgress = (items) => {
      if (items.length === 0) return 0;
      const validItems = items.filter(item => 
        item.description && 
        item.description.length >= 10 &&
        item.status === 'complete'
      );
      return (validItems.length / items.length) * 100;
    };

    const sections = {
      functional: calculateSectionProgress(functionalReqs),
      nonFunctional: calculateSectionProgress(nonFunctionalReqs),
      constraints: calculateSectionProgress(constraints)
    };

    const overall = Object.values(sections).reduce((sum, val) => sum + val, 0) / 3;

    setProgress({ overall, sections });
  }, [functionalReqs, nonFunctionalReqs, constraints]);

  // Effect for auto-save and validation
  useEffect(() => {
    handleAutoSave();
    validateRequirements();
    calculateProgress();
  }, [functionalReqs, nonFunctionalReqs, constraints]);

  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return <Save className="animate-spin text-blue-500" size={20} />;
      case 'saved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const handleUpdate = (type, id, value) => {
    const updateState = {
      functional: setFunctionalReqs,
      nonFunctional: setNonFunctionalReqs,
      constraints: setConstraints
    }[type];

    const items = {
      functional: functionalReqs,
      nonFunctional: nonFunctionalReqs,
      constraints: constraints
    }[type];

    const updatedItems = items.map(item =>
      item.id === id ? { ...item, ...value } : item
    );
    
    updateState(updatedItems);
  };

  const handleAdd = (type) => {
    const newItem = {
      id: Date.now(),
      description: '',
      status: 'pending'
    };

    const updateState = {
      functional: setFunctionalReqs,
      nonFunctional: setNonFunctionalReqs,
      constraints: setConstraints
    }[type];

    const items = {
      functional: functionalReqs,
      nonFunctional: nonFunctionalReqs,
      constraints: constraints
    }[type];

    updateState([...items, newItem]);
  };

  const handleDelete = (type, id) => {
    const updateState = {
      functional: setFunctionalReqs,
      nonFunctional: setNonFunctionalReqs,
      constraints: setConstraints
    }[type];

    const items = {
      functional: functionalReqs,
      nonFunctional: nonFunctionalReqs,
      constraints: constraints
    }[type];

    const updatedItems = items.filter(item => item.id !== id);
    updateState(updatedItems);
  };

  const handleToggle = (type, id) => {
    const items = {
      functional: functionalReqs,
      nonFunctional: nonFunctionalReqs,
      constraints: constraints
    }[type];

    const item = items.find(item => item.id === id);
    handleUpdate(type, id, {
      status: item.status === 'complete' ? 'pending' : 'complete'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Requirements Definition</h1>
              <div className="flex items-center space-x-4">
                {renderSaveStatus()}
                <button
                  onClick={handleSubmit}
                  disabled={validationErrors.length > 0}
                  className={`px-4 py-2 rounded-md text-white ${
                    validationErrors.length > 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Submit Requirements
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Overall Progress</span>
                <span>{Math.round(progress.overall)}%</span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress.overall}%` }}
                />
              </div>
            </div>

            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <h3 className="text-sm font-medium text-red-800">Please fix the following issues:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Requirements sections */}
          <div className="p-6 space-y-8">
            <RequirementSection
              title="Functional Requirements"
              items={functionalReqs}
              progress={progress.sections.functional}
              onUpdate={(id, value) => handleUpdate('functional', id, value)}
              onAdd={() => handleAdd('functional')}
              onDelete={(id) => handleDelete('functional', id)}
              onToggle={(id) => handleToggle('functional', id)}
            />
            
            <RequirementSection
              title="Non-Functional Requirements"
              items={nonFunctionalReqs}
              progress={progress.sections.nonFunctional}
              onUpdate={(id, value) => handleUpdate('nonFunctional', id, value)}
              onAdd={() => handleAdd('nonFunctional')}
              onDelete={(id) => handleDelete('nonFunctional', id)}
              onToggle={(id) => handleToggle('nonFunctional', id)}
            />
            
            <RequirementSection
              title="Constraints"
              items={constraints}
              progress={progress.sections.constraints}
              onUpdate={(id, value) => handleUpdate('constraints', id, value)}
              onAdd={() => handleAdd('constraints')}
              onDelete={(id) => handleDelete('constraints', id)}
              onToggle={(id) => handleToggle('constraints', id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsPage;
