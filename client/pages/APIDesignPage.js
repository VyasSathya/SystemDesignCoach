// client/components/APIDesignPage.js
import React, { useState } from 'react';

const APIDesignPage = ({ data = {}, updateData }) => {
  const [formState, setFormState] = useState({
    apiEndpoints: data.apiEndpoints || '',
    authMethod: data.authMethod || '',
    rateLimit: data.rateLimit || '',
    requestResponse: data.requestResponse || ''
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
      <h2 className="text-xl font-bold text-gray-900">API Design</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Endpoints
        </label>
        <textarea
          name="apiEndpoints"
          value={formState.apiEndpoints}
          onChange={handleChange}
          rows={6}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="List key API endpoints with HTTP methods and purposes..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Authentication & Authorization
        </label>
        <textarea
          name="authMethod"
          value={formState.authMethod}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Auth methods, token handling, permissions..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate Limiting & Quotas
          </label>
          <textarea
            name="rateLimit"
            value={formState.rateLimit}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="API rate limits, quotas, throttling policies..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request/Response Format
          </label>
          <textarea
            name="requestResponse"
            value={formState.requestResponse}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="JSON structure, pagination, error handling..."
          />
        </div>
      </div>
    </div>
  );
};

export default APIDesignPage;