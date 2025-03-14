import React, { useState } from 'react';
import { Plus, Trash2, MessageSquare, Save, Check, Clock, PenTool } from 'lucide-react';
import WorkbookPageWrapper from './WorkbookPageWrapper';

const EnhancedRequirementsPage = ({ data = {}, updateData }) => {
  // Preserve your original state management for functionality
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
  
  // Keep your original handler functions intact
  const addFunctionalReq = () => {
    const newId = functionalReqs.length > 0 ? Math.max(...functionalReqs.map(r => r.id)) + 1 : 1;
    const updatedReqs = [...functionalReqs, { id: newId, text: '', completed: false }];
    setFunctionalReqs(updatedReqs);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        functionalReqs: JSON.stringify(updatedReqs)
      });
    }
  };
  
  const removeFunctionalReq = (id) => {
    const updatedReqs = functionalReqs.filter(req => req.id !== id);
    setFunctionalReqs(updatedReqs);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        functionalReqs: JSON.stringify(updatedReqs)
      });
    }
  };
  
  const updateFunctionalReq = (id, text) => {
    const updatedReqs = functionalReqs.map(req => 
      req.id === id ? { ...req, text } : req
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
  
  const updateNonFunctionalReq = (id, text) => {
    const updatedReqs = nonFunctionalReqs.map(req => 
      req.id === id ? { ...req, text } : req
    );
    setNonFunctionalReqs(updatedReqs);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        nonFunctionalReqs: JSON.stringify(updatedReqs)
      });
    }
  };
  
  const updateConstraints = (value) => {
    setConstraints(value);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        constraints: value
      });
    }
  };
  
  const updateAssumptions = (value) => {
    setAssumptions(value);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        assumptions: value
      });
    }
  };

  const handleSaveAndContinue = () => {
    // Any validation logic here
    updateData(data);
    // Navigation logic to next section
  };

  return (
    <WorkbookPageWrapper
      onSaveAndContinue={handleSaveAndContinue}
      isValid={/* your validation logic */}
      nextSection="API Design"
    >
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
                    onClick={() => removeFunctionalReq(req.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={addFunctionalReq}
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