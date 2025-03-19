import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Check, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

const DataModelPage = ({ data = {}, updateData, onSubmit }) => {
  // State management
  const [entities, setEntities] = useState(() => {
    const saved = localStorage.getItem('dataModel_entities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved entities:', e);
        return [{ id: 1, text: '', completed: false }];
      }
    }
    return [{ id: 1, text: '', completed: false }];
  });

  const [relationships, setRelationships] = useState(() => {
    const saved = localStorage.getItem('dataModel_relationships');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved relationships:', e);
        return [{ id: 1, text: '', type: 'one-to-many', completed: false }];
      }
    }
    return [{ id: 1, text: '', type: 'one-to-many', completed: false }];
  });

  const [databaseChoice, setDatabaseChoice] = useState(() => {
    return localStorage.getItem('dataModel_dbChoice') || '';
  });

  // Status tracking
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [progress, setProgress] = useState({
    entities: 0,
    relationships: 0,
    overall: 0
  });

  // Validation
  const validateDataModel = useCallback(() => {
    const errors = [];
    
    if (entities.length === 0) {
      errors.push('At least one entity must be defined');
    }
    
    if (!databaseChoice.trim()) {
      errors.push('Database choice must be specified');
    }

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  }, [entities, databaseChoice]);

  // Progress calculation
  const calculateProgress = useCallback(() => {
    const entitiesProgress = entities.filter(e => e.completed).length / entities.length;
    const relationshipsProgress = relationships.filter(r => r.completed).length / relationships.length;
    const dbProgress = databaseChoice.trim() ? 1 : 0;
    
    const overall = (entitiesProgress + relationshipsProgress + dbProgress) / 3;
    
    setProgress({
      entities: Math.round(entitiesProgress * 100),
      relationships: Math.round(relationshipsProgress * 100),
      overall: Math.round(overall * 100)
    });
  }, [entities, relationships, databaseChoice]);

  // Auto-save handler
  const handleAutoSave = useCallback(
    debounce(async () => {
      try {
        setSaveStatus('saving');
        
        // Save to localStorage
        localStorage.setItem('dataModel_entities', JSON.stringify(entities));
        localStorage.setItem('dataModel_relationships', JSON.stringify(relationships));
        localStorage.setItem('dataModel_dbChoice', databaseChoice);
        
        // Update parent component
        if (updateData) {
          await updateData({
            entities: JSON.stringify(entities),
            relationships: JSON.stringify(relationships),
            databaseChoice
          });
        }
        
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setSaveStatus('error');
        toast.error('Failed to save changes');
      }
    }, 1000),
    [entities, relationships, databaseChoice, updateData]
  );

  // Effect for auto-save and validation
  useEffect(() => {
    handleAutoSave();
    validateDataModel();
    calculateProgress();
  }, [entities, relationships, databaseChoice]);

  // Load data from props
  useEffect(() => {
    if (data?.entities) {
      try {
        setEntities(JSON.parse(data.entities));
      } catch (e) {
        console.error('Error parsing entities from props:', e);
      }
    }
    if (data?.relationships) {
      try {
        setRelationships(JSON.parse(data.relationships));
      } catch (e) {
        console.error('Error parsing relationships from props:', e);
      }
    }
    if (data?.databaseChoice) {
      setDatabaseChoice(data.databaseChoice);
    }
  }, [data]);

  // CRUD operations for entities
  const updateEntity = (id, text) => {
    setEntities(prev => prev.map(entity =>
      entity.id === id ? { ...entity, text } : entity
    ));
  };

  const toggleEntity = (id) => {
    setEntities(prev => prev.map(entity =>
      entity.id === id ? { ...entity, completed: !entity.completed } : entity
    ));
  };

  const addEntity = () => {
    const newId = Math.max(...entities.map(e => e.id), 0) + 1;
    setEntities(prev => [...prev, { id: newId, text: '', completed: false }]);
  };

  const deleteEntity = (id) => {
    if (entities.length === 1) {
      toast.warning("You must keep at least one entity");
      return;
    }
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  // CRUD operations for relationships
  const updateRelationship = (id, updates) => {
    setRelationships(prev => prev.map(rel =>
      rel.id === id ? { ...rel, ...updates } : rel
    ));
  };

  const toggleRelationship = (id) => {
    setRelationships(prev => prev.map(rel =>
      rel.id === id ? { ...rel, completed: !rel.completed } : rel
    ));
  };

  const addRelationship = () => {
    const newId = Math.max(...relationships.map(r => r.id), 0) + 1;
    setRelationships(prev => [...prev, {
      id: newId,
      text: '',
      type: 'one-to-many',
      sourceEntity: '',
      targetEntity: '',
      completed: false
    }]);
  };

  const deleteRelationship = (id) => {
    if (relationships.length === 1) {
      toast.warning("You must keep at least one relationship");
      return;
    }
    setRelationships(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col space-y-8 p-6">
      {/* Entities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Entities</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Progress: {progress.entities}%
            </div>
            <button
              onClick={addEntity}
              className="flex items-center px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
            >
              <Plus size={16} className="mr-1" /> Add Entity
            </button>
          </div>
        </div>
        
        {/* Entity list */}
        <div className="space-y-3">
          {entities.map(entity => (
            <div key={entity.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
              <button
                onClick={() => toggleEntity(entity.id)}
                className={`mt-1 p-1 rounded ${
                  entity.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}
              >
                <Check size={16} />
              </button>
              
              <textarea
                value={entity.text}
                onChange={(e) => updateEntity(entity.id, e.target.value)}
                placeholder="Enter entity description..."
                className="flex-grow min-h-[60px] p-2 border rounded-md"
              />
              
              <button
                onClick={() => deleteEntity(entity.id)}
                className="mt-1 p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Relationships Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Relationships</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Progress: {progress.relationships}%
            </div>
            <button
              onClick={addRelationship}
              className="flex items-center px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
            >
              <Plus size={16} className="mr-1" /> Add Relationship
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {relationships.map(relationship => (
            <div key={relationship.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
              <button
                onClick={() => toggleRelationship(relationship.id)}
                className={`mt-1 p-1 rounded ${
                  relationship.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}
              >
                <Check size={16} />
              </button>
              
              <div className="flex-grow space-y-2">
                <div className="flex space-x-2">
                  <select
                    value={relationship.sourceEntity}
                    onChange={(e) => updateRelationship(relationship.id, { sourceEntity: e.target.value })}
                    className="flex-1 p-2 border rounded-md"
                  >
                    <option value="">Source Entity...</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.text.split('\n')[0] || 'Untitled Entity'}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={relationship.type}
                    onChange={(e) => updateRelationship(relationship.id, { type: e.target.value })}
                    className="w-40 p-2 border rounded-md"
                  >
                    <option value="one-to-one">One-to-One</option>
                    <option value="one-to-many">One-to-Many</option>
                    <option value="many-to-many">Many-to-Many</option>
                  </select>
                  
                  <select
                    value={relationship.targetEntity}
                    onChange={(e) => updateRelationship(relationship.id, { targetEntity: e.target.value })}
                    className="flex-1 p-2 border rounded-md"
                  >
                    <option value="">Target Entity...</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.text.split('\n')[0] || 'Untitled Entity'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <textarea
                  value={relationship.text}
                  onChange={(e) => updateRelationship(relationship.id, { text: e.target.value })}
                  placeholder="Enter relationship description..."
                  className="w-full min-h-[60px] p-2 border rounded-md"
                />
              </div>
              
              <button
                onClick={() => deleteRelationship(relationship.id)}
                className="mt-1 p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Database Choice Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Database Selection</h2>
        <div className="space-y-2">
          <select
            value={databaseChoice}
            onChange={(e) => setDatabaseChoice(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select a database type...</option>
            <option value="relational">Relational Database (e.g., PostgreSQL, MySQL)</option>
            <option value="document">Document Database (e.g., MongoDB, CouchDB)</option>
            <option value="graph">Graph Database (e.g., Neo4j)</option>
            <option value="key-value">Key-Value Store (e.g., Redis, DynamoDB)</option>
            <option value="time-series">Time Series Database (e.g., InfluxDB)</option>
          </select>
          
          {databaseChoice && (
            <textarea
              value={data.dbJustification || ''}
              onChange={(e) => updateData({ ...data, dbJustification: e.target.value })}
              placeholder="Explain why you chose this database type..."
              className="w-full min-h-[80px] p-2 border rounded-md"
            />
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
          </div>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit Section */}
      <div className="mt-6 border-t pt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Overall Progress: {progress.overall}%
        </div>
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isValid 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Submit Data Model
        </button>
      </div>
    </div>
  );
};

export default DataModelPage;
