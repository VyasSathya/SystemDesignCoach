import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useWorkbook } from '../context/WorkbookContext';
import ProgressBar from '../components/ProgressBar';

const DataModelPage = () => {
  const { state, dispatch } = useWorkbook();
  const { currentProblem, problems } = state;
  
  // Get data from context with default values
  const dataModelData = problems[currentProblem]?.sections?.dataModel || {
    entities: [],
    relationships: [],
    databaseChoice: '',
    databaseJustification: '',
    previewMode: false
  };

  // Initialize state from context data
  const [entities, setEntities] = useState(dataModelData.entities);
  const [relationships, setRelationships] = useState(dataModelData.relationships);
  const [databaseChoice, setDatabaseChoice] = useState(dataModelData.databaseChoice);
  const [databaseJustification, setDatabaseJustification] = useState(dataModelData.databaseJustification);
  const [previewMode, setPreviewMode] = useState(dataModelData.previewMode);

  // Save state when data changes
  useEffect(() => {
    if (currentProblem) {
      dispatch({
        type: 'UPDATE_SECTION_DATA',
        problemId: currentProblem,
        section: 'dataModel',
        data: {
          entities,
          relationships,
          databaseChoice,
          databaseJustification,
          previewMode
        }
      });
    }
  }, [currentProblem, entities, relationships, databaseChoice, databaseJustification, previewMode, dispatch]);

  // Re-initialize state when currentProblem changes
  useEffect(() => {
    const data = problems[currentProblem]?.sections?.dataModel || {
      entities: [],
      relationships: [],
      databaseChoice: '',
      databaseJustification: '',
      previewMode: false
    };
    
    setEntities(data.entities);
    setRelationships(data.relationships);
    setDatabaseChoice(data.databaseChoice);
    setDatabaseJustification(data.databaseJustification);
    setPreviewMode(data.previewMode);
  }, [currentProblem, problems]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addEntity = () => {
    const newEntity = {
      id: generateId(),
      name: 'New Entity',
      text: '',
      attributes: []
    };
    setEntities([...entities, newEntity]);
  };

  const updateEntity = (id, field, value) => {
    setEntities(entities.map(entity =>
      entity.id === id ? { ...entity, [field]: value } : entity
    ));
  };

  const deleteEntity = (id) => {
    setEntities(entities.filter(entity => entity.id !== id));
    setRelationships(relationships.filter(rel => 
      rel.from !== id && rel.to !== id
    ));
  };

  const addRelationship = () => {
    const newRelationship = {
      id: generateId(),
      from: '',
      to: '',
      type: '',
      description: ''
    };
    setRelationships([...relationships, newRelationship]);
  };

  const updateRelationship = (id, field, value) => {
    setRelationships(relationships.map(rel =>
      rel.id === id ? { ...rel, [field]: value } : rel
    ));
  };

  const deleteRelationship = (id) => {
    setRelationships(relationships.filter(rel => rel.id !== id));
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!entities.length) return 0;
    
    const totalItems = entities.length + relationships.length + (databaseChoice ? 1 : 0);
    const completedEntities = entities.filter(e => e.name && e.text).length;
    const completedRelationships = relationships.filter(r => r.from && r.to && r.type).length;
    const completedDatabase = databaseChoice && databaseJustification ? 1 : 0;
    
    return Math.round(((completedEntities + completedRelationships + completedDatabase) / totalItems) * 100);
  };

  // Update progress when data changes
  useEffect(() => {
    if (currentProblem) {
      const progress = calculateProgress();
      dispatch({
        type: 'UPDATE_PROGRESS',
        problemId: currentProblem,
        section: 'dataModel',
        progress
      });
    }
  }, [entities, relationships, databaseChoice, databaseJustification]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <ProgressBar progress={calculateProgress()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Entities Section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">Entities</h2>
              <button 
                onClick={addEntity}
                className="text-indigo-600 text-sm font-medium"
              >
                + Add Entity
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {entities.map(entity => (
                  <div key={entity.id} className="border rounded-md p-3">
                    <div className="flex justify-between mb-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md mr-2"
                        value={entity.name}
                        onChange={(e) => updateEntity(entity.id, 'name', e.target.value)}
                        placeholder="Entity name..."
                      />
                      <button 
                        onClick={() => deleteEntity(entity.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      className="w-full h-32 p-2 border rounded-md text-sm font-mono"
                      value={entity.text}
                      onChange={(e) => updateEntity(entity.id, 'text', e.target.value)}
                      placeholder="Define your entity attributes here..."
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
                      <select 
                        className="px-2 py-1 text-sm border rounded-md w-full sm:w-40"
                        value={rel.from}
                        onChange={(e) => updateRelationship(rel.id, 'from', e.target.value)}
                      >
                        <option value="">Select entity...</option>
                        {entities.map(entity => (
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
                        {entities.map(entity => (
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
                value={databaseChoice}
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
                value={databaseJustification}
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
                    {entities.map(entity => (
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
                    {relationships.map(rel => (
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
                  {databaseChoice && (
                    <div className="p-3 bg-purple-50 rounded-md">
                      <h5 className="font-medium text-purple-800">{databaseChoice}</h5>
                      <p className="text-sm text-gray-600 mt-1">{databaseJustification}</p>
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
