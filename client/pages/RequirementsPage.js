import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Check, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

// Reusable Section Component
const RequirementSection = ({ 
  title, 
  items, 
  onUpdate, 
  onAdd, 
  onDelete, 
  onToggle, 
  onUpdateCategory,
  categories,
  progress,
  type 
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="text-sm text-gray-500">
            Progress: {progress}%
          </div>
          <div className="h-2 w-24 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
        >
          <Plus size={16} className="mr-1" /> Add {type}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
            <button
              onClick={() => onToggle(item.id)}
              className={`mt-1 p-1 rounded ${
                item.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
            >
              <Check size={16} />
            </button>

            <div className="flex-grow">
              <textarea
                value={item.text}
                onChange={(e) => onUpdate(item.id, e.target.value)}
                placeholder={`Enter ${type} description...`}
                className="w-full min-h-[60px] p-2 border rounded-md"
              />
              
              {categories && (
                <select
                  value={item.category}
                  onChange={(e) => onUpdateCategory(item.id, e.target.value)}
                  className="mt-2 p-1 text-sm border rounded-md bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={() => onDelete(item.id)}
              className="mt-1 p-1 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const RequirementsPage = ({ data = {}, updateData, onSubmit }) => {
  // Functional Requirements State
  const [functionalReqs, setFunctionalReqs] = useState(() => {
    const savedReqs = localStorage.getItem('functionalReqs');
    if (savedReqs) {
      try {
        return JSON.parse(savedReqs);
      } catch (e) {
        console.error('Error parsing saved functional requirements:', e);
      }
    }
    return [{ id: 1, text: '', completed: false }];
  });

  // Non-Functional Requirements State
  const [nonFunctionalReqs, setNonFunctionalReqs] = useState(() => {
    const savedReqs = localStorage.getItem('nonFunctionalReqs');
    if (savedReqs) {
      try {
        return JSON.parse(savedReqs);
      } catch (e) {
        console.error('Error parsing saved non-functional requirements:', e);
      }
    }
    return [{ id: 1, text: '', category: 'performance', completed: false }];
  });

  // Add Constraints and Assumptions State
  const [constraints, setConstraints] = useState(() => {
    const saved = localStorage.getItem('constraints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved constraints:', e);
      }
    }
    return [{ id: 1, text: '', type: 'constraint', completed: false }];
  });

  // Add new states for page management
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [progress, setProgress] = useState({
    functional: 0,
    nonFunctional: 0,
    constraints: 0,
    overall: 0
  });

  const nonFunctionalCategories = [
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'scalability', label: 'Scalability' },
    { value: 'reliability', label: 'Reliability' },
    { value: 'usability', label: 'Usability' }
  ];

  const constraintTypes = [
    { value: 'constraint', label: 'Constraint' },
    { value: 'assumption', label: 'Assumption' }
  ];

  // Validation rules
  const validateRequirements = useCallback(() => {
    const errors = [];
    
    // Validate functional requirements
    if (functionalReqs.some(req => !req.text.trim())) {
      errors.push('All functional requirements must be filled');
    }
    
    // Validate non-functional requirements
    if (nonFunctionalReqs.some(req => !req.text.trim())) {
      errors.push('All non-functional requirements must be filled');
    }
    
    // Validate constraints
    if (constraints.some(item => !item.text.trim())) {
      errors.push('All constraints and assumptions must be filled');
    }

    // Minimum requirements
    if (!functionalReqs.some(req => req.completed)) {
      errors.push('At least one functional requirement must be completed');
    }
    if (!nonFunctionalReqs.some(req => req.completed)) {
      errors.push('At least one non-functional requirement must be completed');
    }

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
    
    return errors.length === 0;
  }, [functionalReqs, nonFunctionalReqs, constraints]);

  // Calculate progress
  const calculateProgress = useCallback(() => {
    const functionalProgress = functionalReqs.filter(req => req.completed).length / functionalReqs.length;
    const nonFunctionalProgress = nonFunctionalReqs.filter(req => req.completed).length / nonFunctionalReqs.length;
    const constraintsProgress = constraints.filter(item => item.completed).length / constraints.length;
    
    const overall = (functionalProgress + nonFunctionalProgress + constraintsProgress) / 3;
    
    setProgress({
      functional: Math.round(functionalProgress * 100),
      nonFunctional: Math.round(nonFunctionalProgress * 100),
      constraints: Math.round(constraintsProgress * 100),
      overall: Math.round(overall * 100)
    });
  }, [functionalReqs, nonFunctionalReqs, constraints]);

  // Auto-save handler
  const handleAutoSave = useCallback(
    debounce(async () => {
      try {
        setSaveStatus('saving');
        
        // Save to localStorage
        localStorage.setItem('functionalReqs', JSON.stringify(functionalReqs));
        localStorage.setItem('nonFunctionalReqs', JSON.stringify(nonFunctionalReqs));
        localStorage.setItem('constraints', JSON.stringify(constraints));
        
        // Update parent component
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

  // Effect for auto-save and validation
  useEffect(() => {
    handleAutoSave();
    validateRequirements();
    calculateProgress();
  }, [functionalReqs, nonFunctionalReqs, constraints]);

  // Handle final submission
  const handleSubmit = async () => {
    if (!validateRequirements()) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit({
          functionalReqs,
          nonFunctionalReqs,
          constraints,
          progress
        });
      }
      toast.success('Requirements submitted successfully');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit requirements');
    }
  };

  // Load data from props when available
  useEffect(() => {
    if (data?.functionalReqs) {
      try {
        const parsedReqs = JSON.parse(data.functionalReqs);
        setFunctionalReqs(parsedReqs);
      } catch (e) {
        console.error('Error parsing functional requirements from props:', e);
      }
    }
    if (data?.nonFunctionalReqs) {
      try {
        const parsedReqs = JSON.parse(data.nonFunctionalReqs);
        setNonFunctionalReqs(parsedReqs);
      } catch (e) {
        console.error('Error parsing non-functional requirements from props:', e);
      }
    }
    if (data?.constraints) {
      try {
        const parsed = JSON.parse(data.constraints);
        setConstraints(parsed);
      } catch (e) {
        console.error('Error parsing constraints from props:', e);
      }
    }
  }, [data]);

  // Functional Requirements Handlers
  const updateFunctionalReq = (id, text) => {
    setFunctionalReqs(prev => prev.map(req =>
      req.id === id ? { ...req, text } : req
    ));
  };

  const toggleFunctionalReq = (id) => {
    setFunctionalReqs(prev => prev.map(req =>
      req.id === id ? { ...req, completed: !req.completed } : req
    ));
  };

  const handleAddFunctionalReq = () => {
    const newId = Math.max(...functionalReqs.map(req => req.id), 0) + 1;
    setFunctionalReqs(prev => [...prev, { id: newId, text: '', completed: false }]);
  };

  const handleDeleteFunctionalReq = (id) => {
    if (functionalReqs.length === 1) {
      toast.warning("You must keep at least one functional requirement");
      return;
    }
    setFunctionalReqs(prev => prev.filter(req => req.id !== id));
  };

  // Non-Functional Requirements Handlers
  const updateNonFunctionalReq = (id, text) => {
    setNonFunctionalReqs(prev => prev.map(req =>
      req.id === id ? { ...req, text } : req
    ));
  };

  const updateNonFunctionalCategory = (id, category) => {
    setNonFunctionalReqs(prev => prev.map(req =>
      req.id === id ? { ...req, category } : req
    ));
  };

  const toggleNonFunctionalReq = (id) => {
    setNonFunctionalReqs(prev => prev.map(req =>
      req.id === id ? { ...req, completed: !req.completed } : req
    ));
  };

  const handleAddNonFunctionalReq = () => {
    const newId = Math.max(...nonFunctionalReqs.map(req => req.id), 0) + 1;
    setNonFunctionalReqs(prev => [...prev, { 
      id: newId, 
      text: '', 
      category: 'performance', 
      completed: false 
    }]);
  };

  const handleDeleteNonFunctionalReq = (id) => {
    if (nonFunctionalReqs.length === 1) {
      toast.warning("You must keep at least one non-functional requirement");
      return;
    }
    setNonFunctionalReqs(prev => prev.filter(req => req.id !== id));
  };

  // Add Constraints Handlers
  const updateConstraint = (id, text) => {
    setConstraints(prev => prev.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  };

  const updateConstraintType = (id, type) => {
    setConstraints(prev => prev.map(item =>
      item.id === id ? { ...item, type } : item
    ));
  };

  const toggleConstraint = (id) => {
    setConstraints(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddConstraint = () => {
    const newId = Math.max(...constraints.map(item => item.id), 0) + 1;
    setConstraints(prev => [...prev, { 
      id: newId, 
      text: '', 
      type: 'constraint', 
      completed: false 
    }]);
  };

  const handleDeleteConstraint = (id) => {
    if (constraints.length === 1) {
      toast.warning("You must keep at least one constraint or assumption");
      return;
    }
    setConstraints(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Status Bar */}
      <div className="bg-gray-100 px-6 py-2 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            Progress: {progress.overall}%
          </div>
          <div className="h-2 w-32 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.overall}%` }}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {saveStatus === 'saving' && (
            <span className="text-gray-500 text-sm">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-green-500 text-sm flex items-center">
              <Save size={14} className="mr-1" /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" /> Save failed
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Coach tip box */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 mb-6 text-sm text-indigo-700">
          <strong className="font-medium">Coach tip:</strong> Start with clear, specific functional requirements that describe what the system should do.
        </div>
        
        {/* Functional Requirements */}
        <RequirementSection
          title="Functional Requirements"
          items={functionalReqs}
          onUpdate={updateFunctionalReq}
          onAdd={handleAddFunctionalReq}
          onDelete={handleDeleteFunctionalReq}
          onToggle={toggleFunctionalReq}
          progress={progress.functional}
          type="requirement"
        />

        {/* Non-Functional Requirements */}
        <RequirementSection
          title="Non-Functional Requirements"
          items={nonFunctionalReqs}
          onUpdate={updateNonFunctionalReq}
          onAdd={handleAddNonFunctionalReq}
          onDelete={handleDeleteNonFunctionalReq}
          onToggle={toggleNonFunctionalReq}
          onUpdateCategory={updateNonFunctionalCategory}
          categories={nonFunctionalCategories}
          progress={progress.nonFunctional}
          type="requirement"
        />

        {/* Constraints and Assumptions */}
        <RequirementSection
          title="Constraints & Assumptions"
          items={constraints}
          onUpdate={updateConstraint}
          onAdd={handleAddConstraint}
          onDelete={handleDeleteConstraint}
          onToggle={toggleConstraint}
          onUpdateCategory={updateConstraintType}
          categories={constraintTypes}
          progress={progress.constraints}
          type="item"
        />

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-lg p-4">
            <h3 className="text-red-800 font-medium mb-2">Please fix the following issues:</h3>
            <ul className="list-disc list-inside text-sm text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Section */}
        <div className="mt-6 border-t pt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Overall Progress: {progress.overall}%
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isValid 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Submit Requirements
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementsPage;
