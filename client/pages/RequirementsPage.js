// client/components/RequirementsPage.js
import React, { useState } from 'react';

const RequirementsPage = ({ data = {}, updateData }) => {
  const [formState, setFormState] = useState({
    functionalReqs: data.functionalReqs || '',
    nonFunctionalReqs: data.nonFunctionalReqs || '',
    constraints: data.constraints || '',
    userTypes: data.userTypes || '',
    scale: data.scale || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newState = { ...formState, [name]: value };
    setFormState(newState);
    if (updateData) {
      updateData(newState);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Requirements Analysis</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Functional Requirements
        </label>
        <textarea
          name="functionalReqs"
          value={formState.functionalReqs}
          onChange={handleChange}
          rows={5}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="List the main features and functionalities the system should provide..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Non-Functional Requirements
        </label>
        <textarea
          name="nonFunctionalReqs"
          value={formState.nonFunctionalReqs}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Performance, security, scalability requirements..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Constraints
        </label>
        <textarea
          name="constraints"
          value={formState.constraints}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Technical, business, or regulatory constraints..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User Types
          </label>
          <textarea
            name="userTypes"
            value={formState.userTypes}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Describe different types of users..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scale & Load
          </label>
          <textarea
            name="scale"
            value={formState.scale}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Expected traffic, data volume, request rates..."
          />
        </div>
      </div>
    </div>
  );
};

export default RequirementsPage;