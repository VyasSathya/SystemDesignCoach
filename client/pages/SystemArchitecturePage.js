import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useWorkbook } from '../context/WorkbookContext';
import ProgressBar from '../components/ProgressBar';

const SystemArchitecturePage = ({ contextValue }) => {
  const workbookContext = contextValue || useWorkbook();

  if (!workbookContext) {
    return <div>Loading System Architecture...</div>;
  }
  const { state, dispatch, workbookService } = workbookContext;
  const { currentProblem, problems } = state;

  // Get data from context with default values
  const architectureData = problems[currentProblem]?.sections?.architecture || {
    selectedPattern: '',
    patternDescription: '',
    components: [],
    connections: [],
    deploymentModel: {
      cloud: '',
      containerization: '',
      regions: '',
      cicd: ''
    },
    previewMode: false
  };

  // State management
  const [selectedPattern, setSelectedPattern] = useState(architectureData.selectedPattern);
  const [patternDescription, setPatternDescription] = useState(architectureData.patternDescription);
  const [connections, setConnections] = useState(architectureData.connections || []);
  const [components, setComponents] = useState(architectureData.components || []);
  const [previewMode, setPreviewMode] = useState(architectureData.previewMode);
  const [deploymentModel, setDeploymentModel] = useState(architectureData.deploymentModel);

  // Centralized save function
  const saveData = async (updatedData) => {
    dispatch({
      type: 'UPDATE_SECTION_DATA',
      problemId: currentProblem,
      section: 'architecture',
      data: updatedData
    });

    if (workbookService) {
      try {
        await workbookService.saveAllData(
          currentProblem,
          'architecture',
          {
            sections: {
              architecture: updatedData
            }
          }
        );
      } catch (error) {
        console.error('Failed to save architecture data:', error);
      }
    }
  };

  // Component management functions
  const addComponent = () => {
    const newId = Math.max(...components.map(c => c.id), 0) + 1;
    const newComponent = {
      id: newId,
      name: 'New Component',
      type: 'service',
      description: '',
      technologies: [],
      responsibilities: []
    };
    
    const updatedData = {
      ...architectureData,
      components: [...components, newComponent]
    };
    setComponents(updatedData.components);
    saveData(updatedData);
  };

  const updateComponent = (id, field, value) => {
    const updatedData = {
      ...architectureData,
      components: components.map(component =>
        component.id === id ? { ...component, [field]: value } : component
      )
    };
    setComponents(updatedData.components);
    saveData(updatedData);
  };

  const deleteComponent = (id) => {
    const updatedData = {
      ...architectureData,
      components: components.filter(component => component.id !== id),
      connections: connections.filter(connection => 
        connection.from !== id && connection.to !== id
      )
    };
    setComponents(updatedData.components);
    setConnections(updatedData.connections);
    saveData(updatedData);
  };

  // Connection management functions
  const addConnection = () => {
    const newId = Math.max(...connections.map(c => c.id || 0), 0) + 1;
    const newConnection = {
      id: newId,
      from: components[0]?.id || '', // Default to first component if exists
      to: components[0]?.id || '',
      type: 'REST API',
      description: ''
    };

    const updatedConnections = [...connections, newConnection];
    const updatedData = {
      ...architectureData,
      connections: updatedConnections
    };

    setConnections(updatedConnections);
    saveData(updatedData);
  };

  const updateConnection = (id, field, value) => {
    const updatedConnections = connections.map(connection =>
      connection.id === id ? { ...connection, [field]: value } : connection
    );

    const updatedData = {
      ...architectureData,
      connections: updatedConnections
    };

    setConnections(updatedConnections);
    saveData(updatedData);
  };

  const deleteConnection = (id) => {
    const updatedConnections = connections.filter(connection => connection.id !== id);
    
    const updatedData = {
      ...architectureData,
      connections: updatedConnections
    };

    setConnections(updatedConnections);
    saveData(updatedData);
  };

  // Component array fields update
  const updateComponentArray = (id, field, value) => {
    const updatedData = {
      ...architectureData,
      components: components.map(component => {
        if (component.id === id) {
          const items = value.split(/[,\n]/).map(item => item.trim()).filter(item => item);
          return { ...component, [field]: items };
        }
        return component;
      })
    };
    setComponents(updatedData.components);
    saveData(updatedData);
  };

  // Utility functions
  const getComponentTypeStyle = (type) => {
    switch(type) {
      case 'ui':
        return 'bg-blue-50 border-blue-200';
      case 'service':
        return 'bg-green-50 border-green-200';
      case 'database':
        return 'bg-purple-50 border-purple-200';
      case 'cache':
        return 'bg-yellow-50 border-yellow-200';
      case 'queue':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Deployment model update
  const updateDeploymentModel = (field, value) => {
    const updatedData = {
      ...architectureData,
      deploymentModel: {
        ...deploymentModel,
        [field]: value
      }
    };
    setDeploymentModel(updatedData.deploymentModel);
    saveData(updatedData);
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    const updatedData = {
      ...architectureData,
      previewMode: !previewMode
    };
    setPreviewMode(!previewMode);
    saveData(updatedData);
  };

  // Update pattern
  const updatePattern = (value) => {
    const updatedData = {
      ...architectureData,
      selectedPattern: value
    };
    setSelectedPattern(value);
    saveData(updatedData);
  };

  // Update pattern description
  const updatePatternDescription = (value) => {
    const updatedData = {
      ...architectureData,
      patternDescription: value
    };
    setPatternDescription(value);
    saveData(updatedData);
  };

  // Sync state with context
  useEffect(() => {
    setComponents(architectureData.components);
    setConnections(architectureData.connections);
    setSelectedPattern(architectureData.selectedPattern);
    setPatternDescription(architectureData.patternDescription);
    setDeploymentModel(architectureData.deploymentModel);
    setPreviewMode(architectureData.previewMode);
  }, [currentProblem, problems]);

  // Placeholder progress functions - to be refined later
  const calculateProgress = () => 0;
  const getCompletedSections = () => 0;
  const getTotalSections = () => 4; // Updated from 3 to 4

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with title and preview toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">System Architecture</h1>
        <div className="flex space-x-3">
          <button 
            onClick={togglePreviewMode}
            className={`px-3 py-1.5 text-sm border rounded ${
              previewMode ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>
      
      {/* Coach tip */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-md text-blue-700 text-sm mb-6">
        <strong className="font-medium">Coach tip:</strong> Start with a high-level architecture diagram. Define clear boundaries between components and specify how data flows through the system.
      </div>
      
      {/* Progress bar */}
      <div className="bg-white p-4 border rounded-md mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium">{calculateProgress()}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">{getCompletedSections()}</span> of <span className="font-medium">{getTotalSections()}</span> sections completed
        </div>
      </div>
      
      {/* Main content area */}
      <div className={previewMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
        {/* Left column: Content forms */}
        <div className="space-y-6">
          {/* Architecture Pattern */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-medium text-gray-800">Architecture Pattern</h2>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Pattern</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedPattern}
                  onChange={(e) => updatePattern(e.target.value)}
                >
                  <option value="">Select a pattern...</option>
                  <option value="microservices">Microservices</option>
                  <option value="layered">Layered Architecture</option>
                  <option value="event-driven">Event-Driven</option>
                  <option value="serverless">Serverless</option>
                  <option value="monolithic">Monolithic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pattern Description</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows="4"
                  value={patternDescription}
                  onChange={(e) => updatePatternDescription(e.target.value)}
                  placeholder="Describe why you chose this architecture pattern..."
                />
              </div>
            </div>
          </div>
          
          {/* Components */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">System Components</h2>
              <button 
                className="text-blue-600 text-sm font-medium"
                onClick={addComponent}
              >
                + Add Component
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {components.map(component => (
                  <div 
                    key={component.id} 
                    className={`border rounded-md p-3 ${getComponentTypeStyle(component.type)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-2/3 pr-2">
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md mb-2"
                          value={component.name}
                          onChange={(e) => updateComponent(component.id, 'name', e.target.value)}
                          placeholder="Component Name"
                        />
                      </div>
                      <div className="w-1/3">
                        <select
                          className="w-full p-2 border rounded-md"
                          value={component.type}
                          onChange={(e) => updateComponent(component.id, 'type', e.target.value)}
                        >
                          <option value="ui">UI Component</option>
                          <option value="service">Service</option>
                          <option value="database">Database</option>
                          <option value="cache">Cache</option>
                          <option value="queue">Message Queue</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        value={component.description}
                        onChange={(e) => updateComponent(component.id, 'description', e.target.value)}
                        placeholder="Describe this component's purpose"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                        <textarea
                          className="w-full p-2 border rounded-md"
                          value={component.technologies.join('\n')}
                          onChange={(e) => updateComponentArray(component.id, 'technologies', e.target.value)}
                          placeholder="One per line"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                        <textarea
                          className="w-full p-2 border rounded-md"
                          value={component.responsibilities.join('\n')}
                          onChange={(e) => updateComponentArray(component.id, 'responsibilities', e.target.value)}
                          placeholder="One per line"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteComponent(component.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Connections */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Component Connections</h2>
              <button 
                onClick={addConnection}
                className="text-red-600 text-sm font-medium flex items-center"
                disabled={components.length < 1}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Connection
              </button>
            </div>
            <div className="p-4">
              {connections.map(connection => (
                <div key={connection.id} className="border p-3 rounded-md mb-3">
                  <div className="grid grid-cols-9 gap-2 mb-2">
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                      <select
                        className="w-full p-2 border rounded-md text-sm"
                        value={connection.from}
                        onChange={(e) => updateConnection(connection.id, 'from', Number(e.target.value))}
                      >
                        {components.map(comp => (
                          <option key={`from-${comp.id}`} value={comp.id}>{comp.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end justify-center col-span-1">
                      <span className="text-gray-500">→</span>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                      <select
                        className="w-full p-2 border rounded-md text-sm"
                        value={connection.to}
                        onChange={(e) => updateConnection(connection.id, 'to', Number(e.target.value))}
                      >
                        {components.map(comp => (
                          <option key={`to-${comp.id}`} value={comp.id}>{comp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select
                        className="w-full p-2 border rounded-md text-sm"
                        value={connection.type}
                        onChange={(e) => updateConnection(connection.id, 'type', e.target.value)}
                      >
                        <option value="REST API">REST API</option>
                        <option value="GraphQL">GraphQL</option>
                        <option value="gRPC">gRPC</option>
                        <option value="Message Queue">Message Queue</option>
                        <option value="Database">Database Connection</option>
                        <option value="File">File/Storage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md text-sm"
                        value={connection.description}
                        onChange={(e) => updateConnection(connection.id, 'description', e.target.value)}
                        placeholder="e.g., HTTP/JSON, Binary, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteConnection(connection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Deployment */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-medium text-gray-800">Deployment Model</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cloud Provider</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={deploymentModel.cloud}
                    onChange={(e) => updateDeploymentModel('cloud', e.target.value)}
                    placeholder="e.g., AWS, Azure, GCP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Containerization</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={deploymentModel.containerization}
                    onChange={(e) => updateDeploymentModel('containerization', e.target.value)}
                    placeholder="e.g., Docker, Kubernetes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regions/Zones</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={deploymentModel.regions}
                    onChange={(e) => updateDeploymentModel('regions', e.target.value)}
                    placeholder="e.g., us-east-1, eu-west-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CI/CD Pipeline</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={deploymentModel.cicd}
                    onChange={(e) => updateDeploymentModel('cicd', e.target.value)}
                    placeholder="e.g., Jenkins, GitHub Actions"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Preview */}
        {previewMode && (
          <div className="space-y-6">
            <div className="bg-white border rounded-md overflow-hidden sticky top-6">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">Architecture Preview</h3>
              </div>
              <div className="p-4">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-1">Architecture Pattern</h4>
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-2">
                    <span className="font-medium text-blue-800">{selectedPattern.charAt(0).toUpperCase() + selectedPattern.slice(1)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{patternDescription}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-1">Components</h4>
                  <div className="space-y-4 mb-2">
                    {components.map(component => {
                      const typeColor = component.type === 'ui' ? 'text-blue-600' : 
                                       component.type === 'service' ? 'text-green-600' :
                                       component.type === 'database' ? 'text-purple-600' :
                                       component.type === 'cache' ? 'text-yellow-600' :
                                       component.type === 'queue' ? 'text-orange-600' : 'text-gray-600';
                      
                      return (
                        <div key={`preview-${component.id}`} className={`p-3 border rounded-md ${getComponentTypeStyle(component.type)}`}>
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="font-medium">{component.name}</h5>
                            <span className={`text-xs px-2 py-0.5 bg-white border rounded-full ${typeColor}`}>
                              {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{component.description}</p>
                          
                          {(component.technologies.length > 0 || component.responsibilities.length > 0) && (
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              {component.technologies.length > 0 && (
                                <div>
                                  <h6 className="font-medium mb-1">Technologies:</h6>
                                  <ul className="list-disc list-inside">
                                    {component.technologies.map((tech, i) => (
                                      <li key={`tech-${i}`}>{tech}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {component.responsibilities.length > 0 && (
                                <div>
                                  <h6 className="font-medium mb-1">Responsibilities:</h6>
                                  <ul className="list-disc list-inside">
                                    {component.responsibilities.map((resp, i) => (
                                      <li key={`resp-${i}`}>{resp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-1">Component Connections</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {connections.map(connection => {
                          const fromComponent = components.find(c => c.id === connection.from);
                          const toComponent = components.find(c => c.id === connection.to);
                          
                          return (
                            <tr key={`conn-${connection.id}`}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{fromComponent?.name || 'Unknown'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">{toComponent?.name || 'Unknown'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">{connection.type}</span>
                                {connection.description && <span className="ml-2 text-gray-500">{connection.description}</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-1">Deployment</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">Cloud:</span> {deploymentModel.cloud}
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">Containers:</span> {deploymentModel.containerization}
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">Regions:</span> {deploymentModel.regions}
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">CI/CD:</span> {deploymentModel.cicd}
                    </div>
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

export default SystemArchitecturePage;
