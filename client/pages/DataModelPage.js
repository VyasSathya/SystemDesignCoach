import React, { useState } from 'react';
import ProgressBar from '../components/ProgressBar';

const DataModelPage = () => {
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    entities: true,
    relationships: true,
    database: true
  });
  
  // Demo entities
  const [entities, setEntities] = useState([]);
  
  // Add the addEntity function
  const addEntity = () => {
    const newId = Math.max(...entities.map(e => e.id), 0) + 1;
    setEntities([...entities, {
      id: newId,
      text: 'NewEntity\n- id: UUID (PK)',
      completed: false,
      expanded: true
    }]);
  };
  
  // Add the delete function
  const deleteEntity = (id) => {
    setEntities(entities.filter(entity => entity.id !== id));
  };
  
  // Demo relationships
  const [relationships, setRelationships] = useState([
    { id: 1, sourceEntity: 'User', targetEntity: 'Order', type: 'one-to-many', text: 'One user can have many orders', completed: true },
    { id: 2, sourceEntity: 'Order', targetEntity: 'Product', type: 'many-to-many', text: 'Order can contain multiple products, products can be in multiple orders', completed: false }
  ]);
  
  // Add these functions near your other state management code
  const addRelationship = () => {
    const newId = Math.max(...relationships.map(r => r.id), 0) + 1;
    setRelationships([...relationships, {
      id: newId,
      sourceEntity: '',
      targetEntity: '',
      type: 'one-to-many',
      text: 'Describe the relationship...',
      completed: false
    }]);
  };

  const deleteRelationship = (id) => {
    setRelationships(relationships.filter(rel => rel.id !== id));
  };
  
  // Demo database choice
  const [databaseChoice, setDatabaseChoice] = useState('relational');
  
  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-purple-600">Data Model</h1>
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
      <div className="bg-purple-50 border border-purple-100 p-4 rounded-md text-purple-700 text-sm mb-6">
        <strong className="font-medium">Coach tip:</strong> Define your data entities clearly and establish the relationships between them. Choose a database type that best matches your data structure and application requirements.
      </div>
      
      {/* Progress bar */}
      <div className="bg-white p-4 border rounded-md mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium">67%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full bg-purple-500 rounded-full" style={{ width: '67%' }}></div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">2</span> of <span className="font-medium">3</span> sections completed
        </div>
      </div>
      
      {/* Main content area */}
      <div className={previewMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
        {/* Left column: Content forms */}
        <div className="space-y-6">
          {/* Entities Section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">Entities</h2>
              <button 
                className="text-indigo-600 text-sm font-medium"
                onClick={addEntity}
              >
                + Add Entity
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {entities.map(entity => (
                  <div key={entity.id} className="border rounded-md p-3 bg-white">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium">Entity Definition</h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => deleteEntity(entity.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="w-full h-32 p-2 border rounded-md text-sm font-mono"
                      value={entity.text}
                      onChange={(e) => {
                        const updatedEntities = entities.map(e => 
                          e.id === entity.id ? { ...e, text: e.target.value } : e
                        );
                        setEntities(updatedEntities);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Relationships Section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">Relationships</h2>
              <button 
                onClick={addRelationship}
                className="text-indigo-600 text-sm font-medium"
              >
                + Add Relationship
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {relationships.map(rel => (
                  <div key={rel.id} className="border rounded-md p-3 bg-white">
                    <div className="flex justify-between mb-2">
                      <select className="px-2 py-1 text-sm border rounded-md w-full sm:w-40">
                        <option>User</option>
                        <option>Order</option>
                        <option>Product</option>
                      </select>
                      <div className="hidden sm:flex items-center px-2">→</div>
                      <select className="px-2 py-1 text-sm border rounded-md w-full sm:w-40">
                        <option>Order</option>
                        <option>User</option>
                        <option>Product</option>
                      </select>
                      <div className="flex items-center ml-2 space-x-2">
                        <button className={`p-1 rounded ${rel.completed ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {rel.completed ? '✓' : '○'}
                        </button>
                        <button 
                          onClick={() => deleteRelationship(rel.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="my-2">
                      <select className="px-2 py-1 text-sm border rounded-md w-full">
                        <option>one-to-many</option>
                        <option>one-to-one</option>
                        <option>many-to-many</option>
                      </select>
                    </div>
                    <textarea
                      className="w-full h-20 p-2 border rounded-md text-sm"
                      defaultValue={rel.text}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Database Selection */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-medium text-gray-800">Database Selection</h2>
            </div>
            <div className="p-4">
              <select
                className="w-full p-2 border rounded-md mb-4"
                defaultValue="relational"
              >
                <option value="">Select a database type...</option>
                <option value="relational">Relational Database (e.g., PostgreSQL, MySQL)</option>
                <option value="document">Document Database (e.g., MongoDB, CouchDB)</option>
                <option value="graph">Graph Database (e.g., Neo4j)</option>
                <option value="key-value">Key-Value Store (e.g., Redis, DynamoDB)</option>
                <option value="time-series">Time Series Database (e.g., InfluxDB)</option>
              </select>
              
              <textarea
                className="w-full h-24 p-2 border rounded-md"
                defaultValue="Relational database is a good fit for our data model as we have well-defined relationships between entities. PostgreSQL provides good performance, ACID compliance, and supports complex queries."
                placeholder="Explain why you chose this database type..."
              />
            </div>
          </div>
        </div>
        
        {/* Right column: Preview */}
        {previewMode && (
          <div className="space-y-6">
            <div className="bg-white border rounded-md overflow-hidden sticky top-6">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">Data Model Preview</h3>
              </div>
              <div className="p-4">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">Entities</h4>
                  <div className="space-y-4">
                    <div className="border-2 border-purple-500 rounded-md p-3">
                      <h5 className="font-bold">User</h5>
                      <ul className="list-disc list-inside text-sm">
                        <li>id: UUID (PK)</li>
                        <li>email: String</li>
                        <li>name: String</li>
                        <li>created_at: Timestamp</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="h-6 border-l-2 border-purple-500"></div>
                    </div>
                    
                    <div className="border-2 border-purple-500 rounded-md p-3">
                      <h5 className="font-bold">Order</h5>
                      <ul className="list-disc list-inside text-sm">
                        <li>id: UUID (PK)</li>
                        <li>user_id: UUID (FK)</li>
                        <li>amount: Decimal</li>
                        <li>status: String</li>
                        <li>created_at: Timestamp</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">Relationships</h4>
                  <div className="space-y-2">
                    <div className="p-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">User → Order</span>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">One-to-Many</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">One user can have many orders</p>
                    </div>
                    
                    <div className="p-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Order → Product</span>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">Many-to-Many</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Order can contain multiple products, products can be in multiple orders</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Database Selection</h4>
                  <div className="p-3 bg-purple-50 rounded-md">
                    <h5 className="font-medium text-purple-800">Relational Database (PostgreSQL)</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Relational database is a good fit for our data model as we have well-defined relationships between entities. PostgreSQL provides good performance, ACID compliance, and supports complex queries.
                    </p>
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

export default DataModelPage;
