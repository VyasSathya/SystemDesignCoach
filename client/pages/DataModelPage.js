import React, { useState } from 'react';
import { MessageSquare, Save, PenTool } from 'lucide-react';

const EnhancedDataModelPage = ({ data = {}, updateData }) => {
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-6">
        {/* Coach tip box */}
        <div className="bg-purple-50 border border-purple-100 rounded-md p-4 text-sm text-purple-700">
          <strong className="font-medium">Coach tip:</strong> Start by identifying key entities and their attributes. Consider database selection based on access patterns, not just data volume.
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Data Model</h2>
            <button 
              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
              onClick={() => {/* Add diagram functionality */}}
            >
              <PenTool size={14} className="mr-1" />
              Add ER diagram
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key Entities
            </label>
            <textarea
              name="entities"
              value={formState.entities}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
              placeholder="List main data entities and their attributes..."
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity Relationships
            </label>
            <textarea
              name="relationships"
              value={formState.relationships}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
              placeholder="Define relationships between entities (1:1, 1:N, M:N)..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Database Selection
              </label>
              <textarea
                name="databaseChoice"
                value={formState.databaseChoice}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
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
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                placeholder="Tables/collections structure, indexes..."
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caching Strategy
            </label>
            <textarea
              name="caching"
              value={formState.caching}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
              placeholder="Cache layers, TTL policies, invalidation strategies..."
            />
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-md border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Database Selection Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="border border-gray-300 rounded-md p-2 bg-white hover:bg-purple-50 cursor-pointer">
                <div className="font-medium mb-1 text-purple-700">Relational (SQL)</div>
                <p className="text-gray-600 text-xs">Good for structured data with well-defined schemas and complex relationships. ACID compliance, strong consistency.</p>
              </div>
              <div className="border border-gray-300 rounded-md p-2 bg-white hover:bg-purple-50 cursor-pointer">
                <div className="font-medium mb-1 text-purple-700">Document (NoSQL)</div>
                <p className="text-gray-600 text-xs">Flexible schema, good for semi-structured data, easier horizontal scaling. Examples: MongoDB, Firestore.</p>
              </div>
              <div className="border border-gray-300 rounded-md p-2 bg-white hover:bg-purple-50 cursor-pointer">
                <div className="font-medium mb-1 text-purple-700">Key-Value (NoSQL)</div>
                <p className="text-gray-600 text-xs">Simple data model, high throughput, low latency. Good for caching, session stores. Examples: Redis, DynamoDB.</p>
              </div>
              <div className="border border-gray-300 rounded-md p-2 bg-white hover:bg-purple-50 cursor-pointer">
                <div className="font-medium mb-1 text-purple-700">Graph (NoSQL)</div>
                <p className="text-gray-600 text-xs">Optimized for complex relationships and network structures. Examples: Neo4j, Neptune.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDataModelPage;
