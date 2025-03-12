import React, { useState } from 'react';
import { MessageSquare, Save, PenTool } from 'lucide-react';

const EnhancedSystemArchitecturePage = ({ data = {}, updateData }) => {
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Coach tip box */}
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700">
          <strong className="font-medium">Coach tip:</strong> Start with a high-level architecture diagram. Define clear boundaries between components and specify how data flows through the system.
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">System Architecture</h2>
            <button 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              onClick={() => {/* Add diagram functionality */}}
            >
              <PenTool size={14} className="mr-1" />
              Add diagram
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Architecture Overview
            </label>
            <textarea
              name="overview"
              value={formState.overview}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="High-level description of the architecture (monolith, microservices, etc.)..."
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Components
            </label>
            <textarea
              name="components"
              value={formState.components}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="Services, modules, and their responsibilities..."
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Flow
            </label>
            <textarea
              name="dataFlow"
              value={formState.dataFlow}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              placeholder="How data flows between components and services..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technologies & Frameworks
              </label>
              <textarea
                name="technologies"
                value={formState.technologies}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Cloud infrastructure, containerization, etc..."
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-md border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Architecture Pattern Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="border border-gray-300 rounded-md p-2 bg-white cursor-pointer hover:bg-blue-50">
                <div className="font-medium mb-1 text-blue-700">Microservices</div>
                <p className="text-gray-600 text-xs">Decompose application into small, independent services. Good for complex applications that need independent scaling.</p>
              </div>
              <div className="border border-gray-300 rounded-md p-2 bg-white cursor-pointer hover:bg-blue-50">
                <div className="font-medium mb-1 text-blue-700">Event-Driven</div>
                <p className="text-gray-600 text-xs">Components communicate through events, reducing coupling. Good for systems with asynchronous workflows.</p>
              </div>
              <div className="border border-gray-300 rounded-md p-2 bg-white cursor-pointer hover:bg-blue-50">
                <div className="font-medium mb-1 text-blue-700">Layered Architecture</div>
                <p className="text-gray-600 text-xs">Organize code into layers with specific responsibilities. Classic pattern for many applications.</p>
              </div>
              <div className="border border-gray-300 rounded-md p-2 bg-white cursor-pointer hover:bg-blue-50">
                <div className="font-medium mb-1 text-blue-700">CQRS</div>
                <p className="text-gray-600 text-xs">Separate read and write operations for better performance and scalability. Good for complex domains.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="border-t border-gray-200 p-4 flex justify-between">
        <button className="flex items-center px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
          <MessageSquare size={16} className="mr-2" />
          Ask Coach
        </button>
        <button className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm">
          <Save size={16} className="mr-2" />
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default EnhancedSystemArchitecturePage;