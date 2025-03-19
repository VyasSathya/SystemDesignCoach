import React, { useState } from 'react';

const DataModelPage = () => {
  const [previewMode, setPreviewMode] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    entities: true,
    relationships: true,
    database: true
  });
  
  // Demo entities
  const [entities, setEntities] = useState([
    { id: 1, text: 'User\n- id: UUID (PK)\n- email: String\n- name: String\n- created_at: Timestamp', completed: true },
    { id: 2, text: 'Order\n- id: UUID (PK)\n- user_id: UUID (FK)\n- amount: Decimal\n- status: String\n- created_at: Timestamp', completed: true },
    { id: 3, text: 'Product\n- id: UUID (PK)\n- name: String\n- price: Decimal\n- inventory: Integer', completed: false }
  ]);
  
  // Demo relationships
  const [relationships, setRelationships] = useState([
    { id: 1, sourceEntity: 'User', targetEntity: 'Order', type: 'one-to-many', text: 'One user can have many orders', completed: true },
    { id: 2, sourceEntity: 'Order', targetEntity: 'Product', type: 'many-to-many', text: 'Order can contain multiple products, products can be in multiple orders', completed: false }
  ]);
  
  // Demo database choice
  const [databaseChoice, setDatabaseChoice] = useState('relational');
  const [dbJustification, setDbJustification] = useState('Relational database is a good fit for our data model as we have well-defined relationships between entities. PostgreSQL provides good performance, ACID compliance, and supports complex queries.');
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <h1 className="text-xl font-bold ml-2">Data Model</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={togglePreview}
              className={`flex items-center px-3 py-1.5 text-sm rounded-md border ${
                previewMode ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-600'
              }`}
            >
              {previewMode ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide Preview
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Show Preview
                </>
              )}
            </button>
            <button className="flex items-center px-3 py-1.5 text-sm bg-white border text-gray-600 rounded-md hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Changes
            </button>
            <button className="flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Ask Coach
            </button>
          </div>
        </div>
        
        {/* Coach tip box */}
        <div className="bg-purple-50 border border-purple-100 rounded-md p-4 text-sm text-purple-700">
          <strong className="font-medium">Coach tip:</strong> Define your data entities clearly and establish the relationships between them. Choose a database type that best matches your data structure and application requirements.
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
            <span className="text-sm font-medium text-gray-700">67%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: '67%' }}></div>
          </div>
          
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <span className="font-medium">2</span>
            <span className="mx-1">of</span>
            <span className="font-medium">3</span>
            <span className="ml-1">sections completed</span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Sections */}
          <div className="space-y-6">
            {/* Entities Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('entities')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <h3 className="text-md font-medium text-gray-700 ml-2">Entities</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: '67%' }}></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">67%</span>
                  </div>
                  
                  <button className="text-sm text-purple-600 px-2 py-1 rounded hover:bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  {expandedSections.entities ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              
              {expandedSections.entities && (
                <div className="mt-3 space-y-3">
                  {entities.map(entity => (
                    <div key={entity.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                      <button
                        className={`mt-1 p-1 rounded ${
                          entity.completed ? 'bg-purple-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      
                      <textarea
                        value={entity.text}
                        className="flex-grow min-h-[120px] p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                      />
                      
                      <button className="mt-1 p-1 text-red-500 hover:bg-red-50 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button className="flex items-center px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Entity
                  </button>
                </div>
              )}
            </div>
            
            {/* Relationships Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('relationships')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <h3 className="text-md font-medium text-gray-700 ml-2">Relationships</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: '50%' }}></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">50%</span>
                  </div>
                  
                  <button className="text-sm text-purple-600 px-2 py-1 rounded hover:bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  {expandedSections.relationships ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              
              {expandedSections.relationships && (
                <div className="mt-3 space-y-3">
                  {relationships.map(relationship => (
                    <div key={relationship.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                      <button
                        className={`mt-1 p-1 rounded ${
                          relationship.completed ? 'bg-purple-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      
                      <div className="flex-grow space-y-2">
                        <div className="flex space-x-2">
                          <select className="flex-1 p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Source Entity...</option>
                            {entities.map(entity => (
                              <option key={`source-${entity.id}`} value={entity.id} selected={relationship.sourceEntity === entity.text.split('\n')[0]}>
                                {entity.text.split('\n')[0]}
                              </option>
                            ))}
                          </select>
                          
                          <select className="w-40 p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500">
                            <option value="one-to-one" selected={relationship.type === 'one-to-one'}>One-to-One</option>
                            <option value="one-to-many" selected={relationship.type === 'one-to-many'}>One-to-Many</option>
                            <option value="many-to-many" selected={relationship.type === 'many-to-many'}>Many-to-Many</option>
                          </select>
                          
                          <select className="flex-1 p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500">
                            <option value="">Target Entity...</option>
                            {entities.map(entity => (
                              <option key={`target-${entity.id}`} value={entity.id} selected={relationship.targetEntity === entity.text.split('\n')[0]}>
                                {entity.text.split('\n')[0]}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <textarea
                          value={relationship.text}
                          className="w-full min-h-[60px] p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <button className="mt-1 p-1 text-red-500 hover:bg-red-50 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button className="flex items-center px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Relationship
                  </button>
                </div>
              )}
            </div>
            
            {/* Database Selection */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('database')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <h3 className="text-md font-medium text-gray-700 ml-2">Database Selection</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400" style={{ width: '100%' }}></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">100%</span>
                  </div>
                  
                  {expandedSections.database ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              
              {expandedSections.database && (
                <div className="mt-3 space-y-3">
                  <select
                    value={databaseChoice}
                    className="w-full p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select a database type...</option>
                    <option value="relational">Relational Database (e.g., PostgreSQL, MySQL)</option>
                    <option value="document">Document Database (e.g., MongoDB, CouchDB)</option>
                    <option value="graph">Graph Database (e.g., Neo4j)</option>
                    <option value="key-value">Key-Value Store (e.g., Redis, DynamoDB)</option>
                    <option value="time-series">Time Series Database (e.g., InfluxDB)</option>
                  </select>
                  
                  <textarea
                    value={dbJustification}
                    className="w-full min-h-[80px] p-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Preview Panel - Only shown when preview mode is active */}
          {previewMode && (
            <div className="space-y-6">
              <div className="sticky top-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium text-gray-700">Live Preview</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white border rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                        <span className="text-sm font-medium">Data Model</span>
                        <div className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Preview</div>
                      </div>
                      <div className="p-3">
                        <div className="bg-white p-4 border rounded overflow-auto">
                          <div className="flex flex-col space-y-4">
                            <div className="border-2 border-purple-500 rounded p-3">
                              <h4 className="font-bold">User</h4>
                              <ul className="list-disc list-inside text-sm">
                                <li>id: UUID (PK)</li>
                                <li>email: String</li>
                                <li>name: String</li>
                                <li>created_at: Timestamp</li>
                              </ul>
                            </div>
                            <div className="flex justify-center">
                              <div className="border-l-2 border-purple-500 h-6"></div>
                            </div>
                            <div className="border-2 border-purple-500 rounded p-3">
                              <h4 className="font-bold">Order</h4>
                              <ul className="list-disc list-inside text-sm">
                                <li>id: UUID (PK)</li>
                                <li>user_id: UUID (FK)</li>
                                <li>amount: Decimal</li>
                                <li>status: String</li>
                                <li>created_at: Timestamp</li>
                              </ul>
                            </div>
                            <div className="flex justify-center">
                              <div className="border-l-2 border-purple-500 h-6"></div>
                            </div>
                            <div className="border-2 border-purple-500 rounded p-3">
                              <h4 className="font-bold">Product</h4>
                              <ul className="list-disc list-inside text-sm">
                                <li>id: UUID (PK)</li>
                                <li>name: String</li>
                                <li>price: Decimal</li>
                                <li>inventory: Integer</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                        <span className="text-sm font-medium">Database Selection</span>
                        <div className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Preview</div>
                      </div>
                      <div className="p-3">
                        <div className="bg-white p-4 border rounded">
                          <h4 className="font-medium mb-2">Relational Database (PostgreSQL)</h4>
                          <p className="text-sm text-gray-600">PostgreSQL provides good performance, ACID compliance, and supports complex queries. Well-suited for our well-defined entity relationships.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataModelPage;