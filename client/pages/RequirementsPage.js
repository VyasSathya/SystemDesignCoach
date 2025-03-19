import React, { useState } from 'react';

const RequirementsPage = () => {
  const [previewMode, setPreviewMode] = useState(false);
  
  // Initial requirement data
  const [functionalRequirements, setFunctionalRequirements] = useState([
    { 
      id: 1, 
      title: 'User Authentication',
      description: 'Users must be able to sign up, log in, and manage their account settings.',
      priority: 'high',
      status: 'complete',
      acceptance: [
        'Users can create new accounts with email verification',
        'Users can log in with email/password',
        'Users can reset forgotten passwords',
        'Users can update profile information'
      ]
    },
    { 
      id: 2, 
      title: 'Product Search',
      description: 'Users must be able to search for products using keywords and filters.',
      priority: 'high',
      status: 'complete',
      acceptance: [
        'Search by product name or description',
        'Filter by category, price range, rating',
        'Sort results by relevance, price, popularity',
        'Search results update in real-time as filters are applied'
      ]
    },
    { 
      id: 3, 
      title: 'Shopping Cart',
      description: 'Users must be able to add products to a cart, modify quantities, and proceed to checkout.',
      priority: 'high',
      status: 'pending',
      acceptance: [
        'Add/remove products from cart',
        'Modify product quantities',
        'Cart persists across sessions',
        'Proceed to checkout from cart view'
      ]
    }
  ]);
  
  const [nonFunctionalRequirements, setNonFunctionalRequirements] = useState([
    { 
      id: 1, 
      title: 'Performance',
      description: 'The system must maintain responsive performance under expected load conditions.',
      category: 'performance',
      status: 'complete',
      criteria: [
        'Page load time < 2 seconds',
        'API response time < 200ms for 95% of requests',
        'Support 1000 concurrent users with minimal degradation'
      ]
    },
    { 
      id: 2, 
      title: 'Security',
      description: 'The system must protect user data and prevent unauthorized access.',
      category: 'security',
      status: 'complete',
      criteria: [
        'All sensitive data encrypted at rest and in transit',
        'Password storage using strong hashing algorithms',
        'Protection against common web vulnerabilities (XSS, CSRF, SQL injection)',
        'Regular security audits and penetration testing'
      ]
    },
    { 
      id: 3, 
      title: 'Accessibility',
      description: 'The application must be accessible to users with disabilities.',
      category: 'usability',
      status: 'pending',
      criteria: [
        'WCAG 2.1 AA compliance',
        'Screen reader compatibility',
        'Keyboard navigation support',
        'Sufficient color contrast ratios'
      ]
    }
  ]);
  
  const [constraints, setConstraints] = useState([
    { 
      id: 1, 
      title: 'Budget',
      description: 'Development and infrastructure costs must remain within the approved budget of $150,000.',
      type: 'business',
      status: 'complete'
    },
    { 
      id: 2, 
      title: 'Timeline',
      description: 'The initial version must be completed and launched by Q3 2025.',
      type: 'business',
      status: 'pending'
    },
    { 
      id: 3, 
      title: 'Technology Stack',
      description: 'The system must be built using the company\'s approved tech stack (React, Node.js, PostgreSQL).',
      type: 'technical',
      status: 'complete'
    }
  ]);
  
  // Toggle functions
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  const toggleRequirementStatus = (type, id) => {
    if (type === 'functional') {
      setFunctionalRequirements(functionalRequirements.map(req => 
        req.id === id ? { ...req, status: req.status === 'complete' ? 'pending' : 'complete' } : req
      ));
    } else if (type === 'nonFunctional') {
      setNonFunctionalRequirements(nonFunctionalRequirements.map(req => 
        req.id === id ? { ...req, status: req.status === 'complete' ? 'pending' : 'complete' } : req
      ));
    } else if (type === 'constraint') {
      setConstraints(constraints.map(constraint => 
        constraint.id === id ? { ...constraint, status: constraint.status === 'complete' ? 'pending' : 'complete' } : constraint
      ));
    }
  };
  
  // Add requirement functions
  const addFunctionalRequirement = () => {
    const newId = Math.max(...functionalRequirements.map(req => req.id), 0) + 1;
    setFunctionalRequirements([...functionalRequirements, {
      id: newId,
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      acceptance: []
    }]);
  };
  
  const addNonFunctionalRequirement = () => {
    const newId = Math.max(...nonFunctionalRequirements.map(req => req.id), 0) + 1;
    setNonFunctionalRequirements([...nonFunctionalRequirements, {
      id: newId,
      title: '',
      description: '',
      category: 'performance',
      status: 'pending',
      criteria: []
    }]);
  };
  
  const addConstraint = () => {
    const newId = Math.max(...constraints.map(c => c.id), 0) + 1;
    setConstraints([...constraints, {
      id: newId,
      title: '',
      description: '',
      type: 'business',
      status: 'pending'
    }]);
  };
  
  // Update requirement functions
  const updateFunctionalRequirement = (id, field, value) => {
    setFunctionalRequirements(functionalRequirements.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    ));
  };
  
  const updateFunctionalRequirementAcceptance = (id, value) => {
    setFunctionalRequirements(functionalRequirements.map(req => {
      if (req.id === id) {
        // Split by new lines, trim, and filter empty items
        const criteria = value.split('\n').map(item => item.trim()).filter(item => item);
        return { ...req, acceptance: criteria };
      }
      return req;
    }));
  };
  
  const updateNonFunctionalRequirement = (id, field, value) => {
    setNonFunctionalRequirements(nonFunctionalRequirements.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    ));
  };
  
  const updateNonFunctionalRequirementCriteria = (id, value) => {
    setNonFunctionalRequirements(nonFunctionalRequirements.map(req => {
      if (req.id === id) {
        // Split by new lines, trim, and filter empty items
        const criteria = value.split('\n').map(item => item.trim()).filter(item => item);
        return { ...req, criteria: criteria };
      }
      return req;
    }));
  };
  
  const updateConstraint = (id, field, value) => {
    setConstraints(constraints.map(constraint => 
      constraint.id === id ? { ...constraint, [field]: value } : constraint
    ));
  };
  
  // Delete requirement functions
  const deleteFunctionalRequirement = (id) => {
    setFunctionalRequirements(functionalRequirements.filter(req => req.id !== id));
  };
  
  const deleteNonFunctionalRequirement = (id) => {
    setNonFunctionalRequirements(nonFunctionalRequirements.filter(req => req.id !== id));
  };
  
  const deleteConstraint = (id) => {
    setConstraints(constraints.filter(constraint => constraint.id !== id));
  };
  
  // Priority and category colors
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getCategoryColor = (category) => {
    switch(category) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'usability': return 'bg-purple-100 text-purple-800';
      case 'reliability': return 'bg-orange-100 text-orange-800';
      case 'scalability': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeColor = (type) => {
    switch(type) {
      case 'business': return 'bg-orange-100 text-orange-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'legal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
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
          <span className="text-sm font-medium">66%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '66%' }}></div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">6</span> of <span className="font-medium">9</span> requirements completed
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
                className="text-indigo-600 text-sm font-medium"
                onClick={addFunctionalRequirement}
              >
                + Add Requirement
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {functionalRequirements.map(req => (
                  <div 
                    key={req.id} 
                    className="border rounded-md p-3 bg-white"
                  >
                    <div className="flex justify-between mb-2">
                      <input
                        type="text"
                        className="w-2/3 p-2 border rounded-md"
                        value={req.title}
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
                        value={req.description}
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
                    
                    <div className="flex justify-end">
                      <button 
                        className="text-red-600 text-sm"
                        onClick={() => deleteFunctionalRequirement(req.id)}
                      >
                        Remove
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
                {nonFunctionalRequirements.map(req => (
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
                    
                    <div className="flex justify-end">
                      <button 
                        className="text-red-600 text-sm"
                        onClick={() => deleteNonFunctionalRequirement(req.id)}
                      >
                        Remove
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
                {constraints.map(constraint => (
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
                    
                    <div className="flex justify-end">
                      <button 
                        className="text-red-600 text-sm"
                        onClick={() => deleteConstraint(constraint.id)}
                      >
                        Remove
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
                    {functionalRequirements.map(req => (
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
                    {nonFunctionalRequirements.map(req => (
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
                    {constraints.map(constraint => (
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

export default RequirementsPage;
