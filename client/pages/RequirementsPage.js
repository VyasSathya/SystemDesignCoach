import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useWorkbook } from '../context/WorkbookContext';
import ProgressBar from '../components/ProgressBar';
import { WorkbookProvider } from '../context/WorkbookContext';
import { withWorkbook } from '../components/withWorkbook';

const RequirementsPageContent = () => {
  const { state, dispatch, workbookService } = useWorkbook();
  const { currentProblem, problems } = state;
  
  // Get data from context
  const requirementsData = problems[currentProblem]?.sections?.requirements || {
    functional: [],
    nonFunctional: [],
    constraints: [],
    previewMode: false
  };

  // Initialize state
  const [functional, setFunctional] = useState(requirementsData.functional);
  const [nonFunctional, setNonFunctional] = useState(requirementsData.nonFunctional);
  const [constraints, setConstraints] = useState(requirementsData.constraints);
  const [previewMode, setPreviewMode] = useState(requirementsData.previewMode);

  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Add centralized save function
  const saveData = async (updatedData) => {
    dispatch({
      type: 'UPDATE_SECTION_DATA',
      problemId: currentProblem,
      section: 'requirements',
      data: updatedData
    });

    if (workbookService) {
      try {
        await workbookService.saveAllData(
          currentProblem,
          'requirements',
          {
            sections: {
              requirements: updatedData
            }
          }
        );
      } catch (error) {
        console.error('Failed to save requirements data:', error);
      }
    }
  };

  // Update effect
  useEffect(() => {
    setFunctional(requirementsData.functional);
    setNonFunctional(requirementsData.nonFunctional);
    setConstraints(requirementsData.constraints);
    setPreviewMode(requirementsData.previewMode);
  }, [currentProblem, problems]);

  // Helper function to generate unique IDs
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const addFunctionalRequirement = () => {
    const newRequirement = {
      id: generateId(),
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      acceptance: []
    };

    const updatedData = {
      ...requirementsData,
      functional: [...requirementsData.functional, newRequirement]
    };

    saveData(updatedData);
  };

  const updateFunctionalRequirement = (id, field, value) => {
    const updatedData = {
      ...requirementsData,
      functional: requirementsData.functional.map(req =>
        req.id === id ? { ...req, [field]: value } : req
      )
    };
    saveData(updatedData);
  };

  const updateFunctionalRequirementAcceptance = (id, value) => {
    const criteria = value.split('\n').filter(item => item.trim() !== '');
    
    const updatedData = {
      ...requirementsData,
      functional: requirementsData.functional.map(req =>
        req.id === id ? { ...req, acceptance: criteria } : req
      )
    };

    saveData(updatedData);
  };

  const deleteFunctionalRequirement = (id) => {
    const updatedData = {
      ...requirementsData,
      functional: requirementsData.functional.filter(req => req.id !== id)
    };

    saveData(updatedData);
  };

  const toggleRequirementStatus = (type, id) => {
    const updatedData = {
      ...requirementsData,
      [type]: requirementsData[type].map(req =>
        req.id === id 
          ? { ...req, status: req.status === 'complete' ? 'pending' : 'complete' }
          : req
      )
    };

    saveData(updatedData);
  };

  // Helper function for priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addNonFunctionalRequirement = () => {
    const newRequirement = {
      id: generateId(),
      title: '',
      description: '',
      category: 'performance',
      status: 'pending',
      criteria: []
    };

    const updatedData = {
      ...requirementsData,
      nonFunctional: [...requirementsData.nonFunctional, newRequirement]
    };

    saveData(updatedData);
  };

  const updateNonFunctionalRequirement = (id, field, value) => {
    const updatedData = {
      ...requirementsData,
      nonFunctional: requirementsData.nonFunctional.map(req =>
        req.id === id ? { ...req, [field]: value } : req
      )
    };
    saveData(updatedData);
  };

  const updateNonFunctionalRequirementCriteria = (id, value) => {
    const criteria = value.split('\n').filter(item => item.trim() !== '');
    
    const updatedData = {
      ...requirementsData,
      nonFunctional: requirementsData.nonFunctional.map(req =>
        req.id === id ? { ...req, criteria: criteria } : req
      )
    };

    saveData(updatedData);
  };

  const deleteNonFunctionalRequirement = (id) => {
    const updatedData = {
      ...requirementsData,
      nonFunctional: requirementsData.nonFunctional.filter(req => req.id !== id)
    };

    saveData(updatedData);
  };

  // Helper function for category colors
  const getCategoryColor = (category) => {
    switch (category) {
      case 'performance':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'usability':
        return 'bg-green-100 text-green-800';
      case 'reliability':
        return 'bg-yellow-100 text-yellow-800';
      case 'scalability':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addConstraint = () => {
    const newConstraint = {
      id: generateId(),
      title: '',
      description: '',
      type: 'business',
      status: 'pending'
    };

    const updatedData = {
      ...requirementsData,
      constraints: [...requirementsData.constraints, newConstraint]
    };

    saveData(updatedData);
  };

  const updateConstraint = (id, field, value) => {
    const updatedData = {
      ...requirementsData,
      constraints: requirementsData.constraints.map(constraint =>
        constraint.id === id ? { ...constraint, [field]: value } : constraint
      )
    };
    saveData(updatedData);
  };

  const deleteConstraint = (id) => {
    const updatedData = {
      ...requirementsData,
      constraints: requirementsData.constraints.filter(constraint => constraint.id !== id)
    };

    saveData(updatedData);
  };

  // Helper function for constraint type colors
  const getTypeColor = (type) => {
    switch (type) {
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'technical':
        return 'bg-purple-100 text-purple-800';
      case 'legal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateRequirementStatus = (type, id, newStatus) => {
    const updatedData = {
      ...requirementsData,
      [type]: requirementsData[type].map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    };

    saveData(updatedData);
  };

  // Progress calculation functions
  const calculateProgress = () => {
    // Get all requirements
    const total = requirementsData.functional.length + 
                  requirementsData.nonFunctional.length + 
                  requirementsData.constraints.length;
    
    if (total === 0) return 0;

    // Count only completed requirements
    const completed = 
      requirementsData.functional.filter(req => req.status === 'complete').length +
      requirementsData.nonFunctional.filter(req => req.status === 'complete').length +
      requirementsData.constraints.filter(req => req.status === 'complete').length;

    return Math.round((completed / total) * 100);
  };

  const getCompletedSections = () => {
    return functionalRequirements.filter(req => req.status === 'complete').length +
      nonFunctionalRequirements.filter(req => req.status === 'complete').length +
      constraints.filter(req => req.status === 'complete').length;
  };

  const getTotalSections = () => {
    return functionalRequirements.length +
      nonFunctionalRequirements.length +
      constraints.length;
  };

  useEffect(() => {
    const progress = calculateProgress();
    
    dispatch({
      type: 'UPDATE_PROGRESS',
      problemId: currentProblem,
      section: 'requirements',
      progress
    });
  }, [requirementsData]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-indigo-600">Requirements Definition</h1>
        <div className="flex space-x-3">
          <button 
            onClick={togglePreview}
            className={`px-3 py-1.5 text-sm border rounded ${
              previewMode ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>
      
      {/* Coach tip */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-md text-indigo-700 text-sm mb-6">
        <strong className="font-medium">Coach tip:</strong> Define clear, testable requirements. Functional requirements describe what the system should do, while non-functional requirements specify how the system should behave. Constraints are limitations that affect the design and implementation.
      </div>
      
      {/* Progress bar */}
      <div className="bg-white p-4 border rounded-md mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium">{calculateProgress()}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">
            {requirementsData.functional.filter(req => req.status === 'complete').length +
             requirementsData.nonFunctional.filter(req => req.status === 'complete').length +
             requirementsData.constraints.filter(req => req.status === 'complete').length}
          </span> of{' '}
          <span className="font-medium">
            {requirementsData.functional.length +
             requirementsData.nonFunctional.length +
             requirementsData.constraints.length}
          </span> requirements completed
        </div>
      </div>
      
      {/* Main content area */}
      <div className={previewMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
        {/* Left column: Requirements input forms */}
        <div className="space-y-6">
          {/* Functional Requirements */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">Functional Requirements</h2>
              <button 
                className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center"
                onClick={addFunctionalRequirement}
                type="button"
              >
                <Plus size={16} className="mr-1" />
                Add Requirement
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {requirementsData.functional.map(req => (
                  <div key={req.id} className="border rounded-md p-3 bg-white">
                    <div className="flex justify-between mb-2">
                      <input
                        type="text"
                        className="w-2/3 p-2 border rounded-md"
                        value={req.title || ''}
                        onChange={(e) => updateFunctionalRequirement(req.id, 'title', e.target.value)}
                        placeholder="Requirement Title"
                      />
                      <div className="flex space-x-2 items-center">
                        <select
                          className="p-2 border rounded-md text-sm"
                          value={req.priority}
                          onChange={(e) => updateFunctionalRequirement(req.id, 'priority', e.target.value)}
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <button 
                          className={`p-2 rounded-md ${req.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          onClick={() => toggleRequirementStatus('functional', req.id)}
                        >
                          {req.status === 'complete' ? '✓' : '○'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <textarea
                        className="w-full p-2 border rounded-md"
                        value={req.description || ''}
                        onChange={(e) => updateFunctionalRequirement(req.id, 'description', e.target.value)}
                        placeholder="Describe what the system should do..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Criteria (one per line)</label>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        value={req.acceptance.join('\n')}
                        onChange={(e) => updateFunctionalRequirementAcceptance(req.id, e.target.value)}
                        placeholder="What criteria must be met for this requirement to be satisfied?"
                        rows={3}
                      />
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <button 
                        onClick={() => deleteFunctionalRequirement(req.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Non-Functional Requirements */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">Non-Functional Requirements</h2>
              <button 
                className="text-indigo-600 text-sm font-medium"
                onClick={addNonFunctionalRequirement}
              >
                + Add Requirement
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {requirementsData.nonFunctional.map(req => (
                  <div 
                    key={req.id} 
                    className="border rounded-md p-3 bg-white"
                  >
                    <div className="flex justify-between mb-2">
                      <input
                        type="text"
                        className="w-2/3 p-2 border rounded-md"
                        value={req.title}
                        onChange={(e) => updateNonFunctionalRequirement(req.id, 'title', e.target.value)}
                        placeholder="Requirement Title"
                      />
                      <div className="flex space-x-2 items-center">
                        <select
                          className="p-2 border rounded-md text-sm"
                          value={req.category}
                          onChange={(e) => updateNonFunctionalRequirement(req.id, 'category', e.target.value)}
                        >
                          <option value="performance">Performance</option>
                          <option value="security">Security</option>
                          <option value="usability">Usability</option>
                          <option value="reliability">Reliability</option>
                          <option value="scalability">Scalability</option>
                        </select>
                        <button 
                          className={`p-2 rounded-md ${req.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          onClick={() => toggleRequirementStatus('nonFunctional', req.id)}
                        >
                          {req.status === 'complete' ? '✓' : '○'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <textarea
                        className="w-full p-2 border rounded-md"
                        value={req.description}
                        onChange={(e) => updateNonFunctionalRequirement(req.id, 'description', e.target.value)}
                        placeholder="Describe how the system should perform or behave..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Measurable Criteria (one per line)</label>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        value={req.criteria.join('\n')}
                        onChange={(e) => updateNonFunctionalRequirementCriteria(req.id, e.target.value)}
                        placeholder="How will you measure if this requirement is met?"
                        rows={3}
                      />
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <button 
                        onClick={() => deleteNonFunctionalRequirement(req.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Constraints */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">Constraints</h2>
              <button 
                className="text-indigo-600 text-sm font-medium"
                onClick={addConstraint}
              >
                + Add Constraint
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {requirementsData.constraints.map(constraint => (
                  <div 
                    key={constraint.id} 
                    className="border rounded-md p-3 bg-white"
                  >
                    <div className="flex justify-between mb-2">
                      <input
                        type="text"
                        className="w-2/3 p-2 border rounded-md"
                        value={constraint.title}
                        onChange={(e) => updateConstraint(constraint.id, 'title', e.target.value)}
                        placeholder="Constraint Title"
                      />
                      <div className="flex space-x-2 items-center">
                        <select
                          className="p-2 border rounded-md text-sm"
                          value={constraint.type}
                          onChange={(e) => updateConstraint(constraint.id, 'type', e.target.value)}
                        >
                          <option value="business">Business</option>
                          <option value="technical">Technical</option>
                          <option value="legal">Legal</option>
                        </select>
                        <button 
                          className={`p-2 rounded-md ${constraint.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          onClick={() => toggleRequirementStatus('constraint', constraint.id)}
                        >
                          {constraint.status === 'complete' ? '✓' : '○'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <textarea
                        className="w-full p-2 border rounded-md"
                        value={constraint.description}
                        onChange={(e) => updateConstraint(constraint.id, 'description', e.target.value)}
                        placeholder="Describe the limitation or constraint..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <button 
                        onClick={() => deleteConstraint(constraint.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Preview */}
        {previewMode && (
          <div className="space-y-6">
            <div className="bg-white border rounded-md overflow-hidden sticky top-6">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">Requirements Preview</h3>
              </div>
              <div className="p-4">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Functional Requirements</h4>
                  <div className="space-y-4">
                    {requirementsData.functional.map(req => (
                      <div key={`preview-fr-${req.id}`} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{req.title || 'Untitled Requirement'}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(req.priority)}`}>
                              {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                            </span>
                            <span className={`inline-block w-5 h-5 rounded-full flex items-center justify-center ${
                              req.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {req.status === 'complete' ? '✓' : '○'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                        
                        {req.acceptance.length > 0 && (
                          <div className="mt-2">
                            <h6 className="text-xs font-medium text-gray-700 mb-1">Acceptance Criteria:</h6>
                            <ul className="list-disc list-inside text-xs text-gray-600">
                              {req.acceptance.map((criterion, i) => (
                                <li key={`fr-acc-${i}`}>{criterion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Non-Functional Requirements</h4>
                  <div className="space-y-4">
                    {requirementsData.nonFunctional.map(req => (
                      <div key={`preview-nfr-${req.id}`} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{req.title || 'Untitled Requirement'}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(req.category)}`}>
                              {req.category.charAt(0).toUpperCase() + req.category.slice(1)}
                            </span>
                            <span className={`inline-block w-5 h-5 rounded-full flex items-center justify-center ${
                              req.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {req.status === 'complete' ? '✓' : '○'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                        
                        {req.criteria.length > 0 && (
                          <div className="mt-2">
                            <h6 className="text-xs font-medium text-gray-700 mb-1">Measurable Criteria:</h6>
                            <ul className="list-disc list-inside text-xs text-gray-600">
                              {req.criteria.map((criterion, i) => (
                                <li key={`nfr-criteria-${i}`}>{criterion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Constraints</h4>
                  <div className="space-y-3">
                    {requirementsData.constraints.map(constraint => (
                      <div key={`preview-c-${constraint.id}`} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{constraint.title || 'Untitled Constraint'}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(constraint.type)}`}>
                              {constraint.type.charAt(0).toUpperCase() + constraint.type.slice(1)}
                            </span>
                            <span className={`inline-block w-5 h-5 rounded-full flex items-center justify-center ${
                              constraint.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {constraint.status === 'complete' ? '✓' : '○'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600">{constraint.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RequirementsPage = () => {
  const { state, dispatch, workbookService } = useWorkbook();
  return (
    <WorkbookProvider>
      <RequirementsPageContent />
    </WorkbookProvider>
  );
};

export default withWorkbook(RequirementsPage);
