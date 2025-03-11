// client/components/DataModelPage.js
import React, { useState } from 'react';

const DataModelPage = ({ data = {}, updateData }) => {
  const [formState, setFormState] = useState({
    entities: data.entities || '',
    relationships: data.relationships || '',
    databaseChoice: data.databaseChoice || '',
    schemaDesign: data.schemaDesign || '',
    caching: data.caching || ''
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
      <h2 className="text-xl font-bold text-gray-900">Data Model</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Key Entities
        </label>
        <textarea
          name="entities"
          value={formState.entities}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="List main data entities and their attributes..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Entity Relationships
        </label>
        <textarea
          name="relationships"
          value={formState.relationships}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Define relationships between entities (1:1, 1:N, M:N)..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Database Selection
          </label>
          <textarea
            name="databaseChoice"
            value={formState.databaseChoice}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="SQL vs NoSQL, specific database technologies..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schema Design
          </label>
          <textarea
            name="schemaDesign"
            value={formState.schemaDesign}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Tables/collections structure, indexes..."
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Caching Strategy
        </label>
        <textarea
          name="caching"
          value={formState.caching}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Cache layers, TTL policies, invalidation strategies..."
        />
      </div>
    </div>
  );
};

export default DataModelPage;