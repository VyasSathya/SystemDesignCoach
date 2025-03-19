import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useWorkbook } from '../context/WorkbookContext';
import ProgressBar from '../components/ProgressBar';

const DataModelPage = () => {
  const { state, dispatch, workbookService } = useWorkbook();  // Get workbookService from context
  const { currentProblem, problems } = state;
  const [previewMode, setPreviewMode] = useState(false);
  
  const dataModelData = problems[currentProblem]?.sections?.dataModel || {
    entities: [],
    relationships: [],
    databaseChoice: '',
    databaseJustification: ''
  };

  const saveData = async (updatedData) => {
    dispatch({
      type: 'UPDATE_SECTION_DATA',
      problemId: currentProblem,
      section: 'dataModel',
      data: updatedData
    });

    if (workbookService) {
      try {
        await workbookService.saveAllData(
          currentProblem,
          'dataModel',
          {
            sections: {
              dataModel: updatedData
            }
          }
        );
      } catch (error) {
        console.error('Failed to save:', error);
      }
    }
  };

  const setDatabaseChoice = (value) => {
    const updatedData = {
      ...dataModelData,
      databaseChoice: value
    };
    saveData(updatedData);
  };

  const setDatabaseJustification = (value) => {
    const updatedData = {
      ...dataModelData,
      databaseJustification: value
    };
    saveData(updatedData);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Relationship management functions
  const addRelationship = () => {
    const newRelationship = {
      id: generateId(),
      from: '',
      to: '',
      type: '',
      description: '',
      completed: false
    };

    const updatedData = {
      ...dataModelData,
      relationships: [...dataModelData.relationships, newRelationship]
    };

    saveData(updatedData);
  };

  const updateRelationship = (id, field, value) => {
    const updatedData = {
      ...dataModelData,
      relationships: dataModelData.relationships.map(rel =>
        rel.id === id ? { ...rel, [field]: value } : rel
      )
    };

    saveData(updatedData);
  };

  const deleteRelationship = (id) => {
    const updatedData = {
      ...dataModelData,
      relationships: dataModelData.relationships.filter(rel => rel.id !== id)
    };

    saveData(updatedData);
  };

  const addEntity = () => {
    const newEntity = {
      id: generateId(),
      text: '',
      name: 'New Entity'
    };

    const updatedData = {
      ...dataModelData,
      entities: [...dataModelData.entities, newEntity]
    };

    saveData(updatedData);
  };

  const updateEntity = (id, field, value) => {
    const updatedData = {
      ...dataModelData,
      entities: dataModelData.entities.map(entity =>
        entity.id === id ? { ...entity, [field]: value } : entity
      )
    };

    saveData(updatedData);
  };

  const deleteEntity = (id) => {
    const updatedData = {
      ...dataModelData,
      entities: dataModelData.entities.filter(entity => entity.id !== id)
    };

    saveData(updatedData);
  };

  const calculateProgress = () => {
    // Add your progress calculation logic here
    return 0;
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
        <strong className="font-medium">Coach tip:</strong> Start by identifying the core entities in your system and their attributes. Then, establish clear relationships between these entities. Choose a database type that best suits your data structure and access patterns.
      </div>

      <ProgressBar 
        progress={calculateProgress()}
        completed={0}
        total={3}
      />
      
      {/* Main content area */}
      <div className={previewMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
        {/* Left column: Content forms */}
        <div className="space-y-6">
          {/* Entity Definition Section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">Entity Definition</h2>
              <button 
                onClick={addEntity}
                className="text-indigo-600 text-sm font-medium"
              >
                + Add Entity
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {dataModelData.entities.map(entity => (
                  <div key={entity.id} className="border rounded-md p-3 bg-white">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-sm font-medium">Entity Definition</h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => deleteEntity(entity.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="w-full h-32 p-2 border rounded-md text-sm font-mono"
                      value={entity.text}
                      onChange={(e) => updateEntity(entity.id, 'text', e.target.value)}
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
                {dataModelData.relationships.map(rel => (
                  <div key={rel.id} className="border rounded-md p-3 bg-white">
                    <div className="flex justify-between mb-2">
                      <select 
                        className="px-2 py-1 text-sm border rounded-md w-full sm:w-40"
                        value={rel.from}
                        onChange={(e) => updateRelationship(rel.id, 'from', e.target.value)}
                      >
                        <option value="">Select entity...</option>
                        {dataModelData.entities.map(entity => (
                          <option key={entity.id} value={entity.id}>{entity.name}</option>
                        ))}
                      </select>
                      <div className="hidden sm:flex items-center px-2">→</div>
                      <select 
                        className="px-2 py-1 text-sm border rounded-md w-full sm:w-40"
                        value={rel.to}
                        onChange={(e) => updateRelationship(rel.id, 'to', e.target.value)}
                      >
                        <option value="">Select entity...</option>
                        {dataModelData.entities.map(entity => (
                          <option key={entity.id} value={entity.id}>{entity.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center ml-2 space-x-2">
                        <button className={`p-1 rounded ${rel.completed ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {rel.completed ? '✓' : '○'}
                        </button>
                        <button 
                          onClick={() => deleteRelationship(rel.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="my-2">
                      <select 
                        className="px-2 py-1 text-sm border rounded-md w-full"
                        value={rel.type}
                        onChange={(e) => updateRelationship(rel.id, 'type', e.target.value)}
                      >
                        <option value="">Select relationship type...</option>
                        <option value="one-to-many">one-to-many</option>
                        <option value="one-to-one">one-to-one</option>
                        <option value="many-to-many">many-to-many</option>
                      </select>
                    </div>
                    <textarea
                      className="w-full h-20 p-2 border rounded-md text-sm"
                      value={rel.description || ''}
                      onChange={(e) => updateRelationship(rel.id, 'description', e.target.value)}
                      placeholder="Describe the relationship between these entities..."
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
                value={dataModelData.databaseChoice}
                onChange={(e) => setDatabaseChoice(e.target.value)}
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
                value={dataModelData.databaseJustification}
                onChange={(e) => setDatabaseJustification(e.target.value)}
                placeholder="Explain why this database type is the best fit for your data model. Consider factors like data structure, relationships, query patterns, and scalability requirements..."
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
                    {dataModelData.entities.map(entity => (
                      <div key={entity.id} className="border-2 border-purple-500 rounded-md p-3">
                        <h5 className="font-bold">{entity.name}</h5>
                        <ul className="list-disc list-inside text-sm">
                          {entity.attributes.map(attr => (
                            <li key={attr.id}>
                              {attr.name}: {attr.type}
                              {attr.isPrimary ? ' (PK)' : ''}
                              {attr.isForeign ? ' (FK)' : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">Relationships</h4>
                  <div className="space-y-2">
                    {dataModelData.relationships.map(rel => (
                      <div key={rel.id} className="p-2 border rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{rel.from} → {rel.to}</span>
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                            {rel.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{rel.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Database Selection</h4>
                  {dataModelData.databaseChoice && (
                    <div className="p-3 bg-purple-50 rounded-md">
                      <h5 className="font-medium text-purple-800">{dataModelData.databaseChoice}</h5>
                      <p className="text-sm text-gray-600 mt-1">{dataModelData.databaseJustification}</p>
                    </div>
                  )}
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
