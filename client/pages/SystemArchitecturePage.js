// client/components/SystemArchitecturePage.js
import React, { useState } from 'react';

const SystemArchitecturePage = ({ data = {}, updateData }) => {
  const [formState, setFormState] = useState({
    overview: data.overview || '',
    components: data.components || '',
    dataFlow: data.dataFlow || '',
    technologies: data.technologies || '',
    deploymentModel: data.deploymentModel || ''
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
      <h2 className="text-xl font-bold text-gray-900">System Architecture</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Architecture Overview
        </label>
        <textarea
          name="overview"
          value={formState.overview}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="High-level description of the architecture (monolith, microservices, etc.)..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Key Components
        </label>
        <textarea
          name="components"
          value={formState.components}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Services, modules, and their responsibilities..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data Flow
        </label>
        <textarea
          name="dataFlow"
          value={formState.dataFlow}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="How data flows between components and services..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technologies & Frameworks
          </label>
          <textarea
            name="technologies"
            value={formState.technologies}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Key technologies, frameworks, and libraries..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deployment Model
          </label>
          <textarea
            name="deploymentModel"
            value={formState.deploymentModel}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Cloud infrastructure, containerization, etc..."
          />
        </div>
      </div>
    </div>
  );
};

export default SystemArchitecturePage;