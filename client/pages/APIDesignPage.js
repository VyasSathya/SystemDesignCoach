import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';

const APIDesignPage = () => {
  const [previewMode, setPreviewMode] = useState(false);
  
  // API type state
  const [apiType, setApiType] = useState('REST');
  
  // Endpoints state
  const [endpoints, setEndpoints] = useState([]);
  
  // Auth methods state
  const [authMethods, setAuthMethods] = useState([]);
  
  // Error handling state
  const [errorHandling, setErrorHandling] = useState([]);
  
  // Methods
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  
  // Parameter types
  const paramTypes = ['string', 'number', 'boolean', 'object', 'array', 'date'];
  
  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  // Handle API type change
  const handleApiTypeChange = (type) => {
    setApiType(type);
  };
  
  // Handle endpoint expansion
  const toggleExpand = (id) => {
    setEndpoints(endpoints.map(endpoint => 
      endpoint.id === id ? { ...endpoint, expanded: !endpoint.expanded } : endpoint
    ));
  };
  
  // Add new endpoint
  const addEndpoint = () => {
    const newId = Math.max(...endpoints.map(e => e.id), 0) + 1;
    setEndpoints([...endpoints, {
      id: newId,
      path: '',
      method: 'GET',
      description: '',
      requestParams: [],
      requestBody: '',
      responseFormat: '{}',
      expanded: true
    }]);
  };
  
  // Update endpoint
  const updateEndpoint = (id, field, value) => {
    setEndpoints(endpoints.map(endpoint => 
      endpoint.id === id ? { ...endpoint, [field]: value } : endpoint
    ));
  };
  
  // Delete endpoint
  const deleteEndpoint = (id) => {
    setEndpoints(endpoints.filter(endpoint => endpoint.id !== id));
  };
  
  // Add request parameter
  const addRequestParam = (endpointId) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;
    
    const newParamId = endpoint.requestParams.length > 0 
      ? Math.max(...endpoint.requestParams.map(p => p.id)) + 1 
      : 1;
    
    const updatedParams = [
      ...endpoint.requestParams, 
      { id: newParamId, name: '', type: 'string', required: false, description: '' }
    ];
    
    updateEndpoint(endpointId, 'requestParams', updatedParams);
  };
  
  // Update request parameter
  const updateRequestParam = (endpointId, paramId, field, value) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;
    
    const updatedParams = endpoint.requestParams.map(param => 
      param.id === paramId ? { ...param, [field]: value } : param
    );
    
    updateEndpoint(endpointId, 'requestParams', updatedParams);
  };
  
  // Delete request parameter
  const deleteRequestParam = (endpointId, paramId) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint) return;
    
    const updatedParams = endpoint.requestParams.filter(param => param.id !== paramId);
    updateEndpoint(endpointId, 'requestParams', updatedParams);
  };
  
  // Method badge color
  const getMethodColor = (method) => {
    switch(method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'PATCH': return 'bg-orange-100 text-orange-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (!endpoints.length) return 0;
    const completedEndpoints = endpoints.filter(endpoint => {
      return endpoint.path && 
             endpoint.responseFormat && 
             (endpoint.method === 'GET' || endpoint.requestBody);
    }).length;
    return (completedEndpoints / endpoints.length) * 100;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-green-600">API Design</h1>
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
      <div className="bg-green-50 border border-green-100 p-4 rounded-md text-green-700 text-sm mb-6">
        <strong className="font-medium">Coach tip:</strong> Define clear, RESTful endpoints with consistent naming conventions. Document request parameters thoroughly and specify response formats for better developer experience.
      </div>
      
      {/* Progress bar */}
      <div className="bg-white p-4 border rounded-md mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium">75%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">2</span> of <span className="font-medium">3</span> endpoints fully documented
        </div>
      </div>
      
      {/* Main content area */}
      <div className={previewMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
        {/* Left column: API design input forms */}
        <div className="space-y-6">
          {/* API Type */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-medium text-gray-800">API Type</h2>
            </div>
            <div className="p-4">
              <div className="flex space-x-4">
                {['REST', 'GraphQL', 'gRPC', 'WebSocket'].map(type => (
                  <label key={type} className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-green-600 h-4 w-4"
                      checked={apiType === type}
                      onChange={() => handleApiTypeChange(type)}
                    />
                    <span className="ml-2 text-sm">{type}</span>
                  </label>
                ))}
              </div>
              
              {apiType === 'GraphQL' && (
                <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 text-xs rounded">
                  <strong>Note:</strong> GraphQL requires a schema definition rather than individual endpoints. 
                  Use the schema editor below instead of the endpoints section.
                </div>
              )}
            </div>
          </div>
          
          {/* Endpoints */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
              <h2 className="font-medium text-gray-800">API Endpoints</h2>
              <button 
                className="text-indigo-600 text-sm font-medium"
                onClick={addEndpoint}
              >
                + Add Endpoint
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {endpoints.map(endpoint => (
                  <div 
                    key={endpoint.id} 
                    className="border rounded-md overflow-hidden"
                  >
                    {/* Endpoint Header */}
                    <div 
                      className="flex items-center justify-between p-3 bg-gray-50 border-b"
                      onClick={() => toggleExpand(endpoint.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <input
                          type="text"
                          className="px-2 py-1 border rounded-md"
                          value={endpoint.path}
                          onChange={(e) => updateEndpoint(endpoint.id, 'path', e.target.value)}
                          placeholder="Path (e.g., /api/resource)"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 text-gray-500 hover:text-gray-700"
                          onClick={() => toggleExpand(endpoint.id)}
                        >
                          {endpoint.expanded ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteEndpoint(endpoint.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Endpoint Details */}
                    {endpoint.expanded && (
                      <div className="p-4 space-y-4">
                        {/* Method Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">HTTP Method</label>
                          <select
                            className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                            value={endpoint.method}
                            onChange={(e) => updateEndpoint(endpoint.id, 'method', e.target.value)}
                          >
                            {methods.map(method => (
                              <option key={method} value={method}>{method}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            className="w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
                            value={endpoint.description}
                            onChange={(e) => updateEndpoint(endpoint.id, 'description', e.target.value)}
                            placeholder="What does this endpoint do?"
                            rows={2}
                          />
                        </div>
                        
                        {/* Request Parameters */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Request Parameters</label>
                            <button 
                              className="text-green-600 text-xs font-medium"
                              onClick={() => addRequestParam(endpoint.id)}
                            >
                              + Add Parameter
                            </button>
                          </div>
                          
                          {endpoint.requestParams.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                              {/* Table Header */}
                              <div className="bg-gray-50 px-3 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
                                <div className="col-span-3">Name</div>
                                <div className="col-span-3">Type</div>
                                <div className="col-span-1">Req</div>
                                <div className="col-span-4">Description</div>
                                <div className="col-span-1"></div>
                              </div>
                              
                              {/* Parameters */}
                              {endpoint.requestParams.map(param => (
                                <div key={param.id} className="px-3 py-2 border-t border-gray-200 grid grid-cols-12 gap-2 text-sm">
                                  <div className="col-span-3">
                                    <input
                                      type="text"
                                      className="w-full px-2 py-1 border rounded-md focus:ring-green-500 focus:border-green-500"
                                      value={param.name}
                                      onChange={(e) => updateRequestParam(endpoint.id, param.id, 'name', e.target.value)}
                                      placeholder="Parameter name"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <select
                                      className="w-full px-2 py-1 border rounded-md focus:ring-green-500 focus:border-green-500"
                                      value={param.type}
                                      onChange={(e) => updateRequestParam(endpoint.id, param.id, 'type', e.target.value)}
                                    >
                                      {paramTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-span-2 flex items-center">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                                      checked={param.required}
                                      onChange={(e) => updateRequestParam(endpoint.id, param.id, 'required', e.target.checked)}
                                    />
                                    <span className="ml-2 text-sm">Required</span>
                                  </div>
                                  <div className="col-span-4">
                                    <input
                                      type="text"
                                      className="w-full px-2 py-1 border rounded-md focus:ring-green-500 focus:border-green-500"
                                      value={param.description}
                                      onChange={(e) => updateRequestParam(endpoint.id, param.id, 'description', e.target.value)}
                                      placeholder="Description"
                                    />
                                  </div>
                                  <div className="col-span-1 flex justify-end">
                                    <button 
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => deleteRequestParam(endpoint.id, param.id)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center border border-dashed rounded-md py-4 text-sm text-gray-500">
                              No parameters defined. Click "Add Parameter" to add one.
                            </div>
                          )}
                        </div>
                        
                        {/* Request Body for non-GET methods */}
                        {endpoint.method !== 'GET' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Request Body</label>
                            <textarea
                              className="w-full px-3 py-2 border rounded-md font-mono text-sm focus:ring-green-500 focus:border-green-500"
                              value={endpoint.requestBody}
                              onChange={(e) => updateEndpoint(endpoint.id, 'requestBody', e.target.value)}
                              placeholder="JSON schema for request body"
                              rows={6}
                            />
                          </div>
                        )}
                        
                        {/* Response Format */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Response Format</label>
                          <textarea
                            className="w-full px-3 py-2 border rounded-md font-mono text-sm focus:ring-green-500 focus:border-green-500"
                            value={endpoint.responseFormat}
                            onChange={(e) => updateEndpoint(endpoint.id, 'responseFormat', e.target.value)}
                            placeholder="JSON schema for response"
                            rows={6}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Preview */}
        {previewMode && (
          <div className="space-y-6">
            <div className="bg-white border rounded-md overflow-hidden sticky top-6">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">API Preview</h3>
              </div>
              <div className="p-4">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">API Type</h4>
                  <div className="p-2 bg-gray-50 rounded-md text-sm">
                    <span className="font-medium">{apiType}</span>
                    {apiType === 'REST' && <span className="text-xs text-gray-500 ml-2">Representational State Transfer</span>}
                    {apiType === 'GraphQL' && <span className="text-xs text-gray-500 ml-2">Query Language for APIs</span>}
                    {apiType === 'gRPC' && <span className="text-xs text-gray-500 ml-2">High-performance RPC framework</span>}
                    {apiType === 'WebSocket' && <span className="text-xs text-gray-500 ml-2">Real-time communication protocol</span>}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Endpoints</h4>
                  <div className="space-y-4">
                    {endpoints.map(endpoint => {
                      const methodColor = getMethodColor(endpoint.method);
                      
                      return (
                        <div key={`preview-${endpoint.id}`} className="border rounded-md overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${methodColor}`}>
                                {endpoint.method}
                              </span>
                              <span className="ml-2 font-mono text-sm">
                                {endpoint.path || '/path'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{endpoint.description}</p>
                          </div>
                          
                          <div className="p-3">
                            {endpoint.requestParams.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Parameters</h5>
                                <div className="bg-gray-50 p-2 rounded-md">
                                  <table className="min-w-full text-xs">
                                    <thead>
                                      <tr className="text-left text-gray-500">
                                        <th className="pr-2 py-1">Name</th>
                                        <th className="px-2 py-1">Type</th>
                                        <th className="px-2 py-1">Required</th>
                                        <th className="pl-2 py-1">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {endpoint.requestParams.map(param => (
                                        <tr key={`preview-param-${param.id}`}>
                                          <td className="pr-2 py-1 font-mono">{param.name || '-'}</td>
                                          <td className="px-2 py-1">{param.type}</td>
                                          <td className="px-2 py-1">{param.required ? 'Yes' : 'No'}</td>
                                          <td className="pl-2 py-1 text-gray-600">{param.description || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                            
                            {endpoint.method !== 'GET' && endpoint.requestBody && (
                              <div className="mb-3">
                                <h5 className="text-xs font-medium text-gray-700 mb-1">Request Body</h5>
                                <div className="bg-gray-900 text-white p-3 rounded-md font-mono text-xs overflow-auto">
                                  <pre>{endpoint.requestBody}</pre>
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <h5 className="text-xs font-medium text-gray-700 mb-1">Response</h5>
                              <div className="bg-gray-900 text-white p-3 rounded-md font-mono text-xs overflow-auto">
                                <pre>{endpoint.responseFormat}</pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

export default APIDesignPage;
