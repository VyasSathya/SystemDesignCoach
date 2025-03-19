import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, MessageSquare, Save, Clock, PenTool } from 'lucide-react';

const EnhancedAPIDesignPage = ({ data = {}, updateData }) => {
  // Preserve original state management for functionality
  const [apis, setApis] = useState(
    data.apis ? JSON.parse(data.apis) : [
      {
        id: 1,
        endpoint: '/api/resource',
        method: 'GET',
        description: 'Get all resources',
        requestParams: [{ id: 1, name: 'limit', type: 'number', required: false, description: 'Maximum results to return' }],
        responseFormat: '[\n  {\n    "id": "string",\n    "name": "string"\n  }\n]',
        expanded: true
      }
    ]
  );
  
  const [apiType, setApiType] = useState(data.apiType || 'REST');
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  
  // Keep original handler functions
  const addAPI = () => {
    const newId = apis.length > 0 ? Math.max(...apis.map(api => api.id)) + 1 : 1;
    const updatedApis = [...apis, {
      id: newId,
      endpoint: '',
      method: 'GET',
      description: '',
      requestParams: [],
      responseFormat: '{}',
      expanded: true
    }];
    
    setApis(updatedApis);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        apis: JSON.stringify(updatedApis)
      });
    }
  };
  
  const removeAPI = (id) => {
    const updatedApis = apis.filter(api => api.id !== id);
    setApis(updatedApis);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        apis: JSON.stringify(updatedApis)
      });
    }
  };
  
  const updateAPI = (id, field, value) => {
    const updatedApis = apis.map(api => 
      api.id === id ? { ...api, [field]: value } : api
    );
    setApis(updatedApis);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        apis: JSON.stringify(updatedApis)
      });
    }
  };
  
  const toggleExpand = (id) => {
    const updatedApis = apis.map(api => 
      api.id === id ? { ...api, expanded: !api.expanded } : api
    );
    setApis(updatedApis);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        apis: JSON.stringify(updatedApis)
      });
    }
  };
  
  const addRequestParam = (apiId) => {
    const api = apis.find(a => a.id === apiId);
    if (!api) return;
    
    const newParamId = api.requestParams.length > 0 
      ? Math.max(...api.requestParams.map(p => p.id)) + 1 
      : 1;
      
    const newParams = [...api.requestParams, {
      id: newParamId,
      name: '',
      type: 'string',
      required: false,
      description: ''
    }];
    
    updateAPI(apiId, 'requestParams', newParams);
  };
  
  const removeRequestParam = (apiId, paramId) => {
    const api = apis.find(a => a.id === apiId);
    if (!api) return;
    
    const newParams = api.requestParams.filter(p => p.id !== paramId);
    updateAPI(apiId, 'requestParams', newParams);
  };
  
  const updateRequestParam = (apiId, paramId, field, value) => {
    const api = apis.find(a => a.id === apiId);
    if (!api) return;
    
    const newParams = api.requestParams.map(p => 
      p.id === paramId ? { ...p, [field]: value } : p
    );
    
    updateAPI(apiId, 'requestParams', newParams);
  };

  const updateApiType = (type) => {
    setApiType(type);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        apiType: type
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Coach tip box */}
        <div className="bg-green-50 border border-green-100 rounded-md p-4 text-sm text-green-700">
          <strong className="font-medium">Coach tip:</strong> Define clear, RESTful endpoints with consistent naming conventions. Document request parameters thoroughly and specify response formats for better developer experience.
        </div>
      
        {/* API Type Selection */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">API Type</h2>
            <button 
              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
              onClick={() => {/* Add diagram functionality */}}
            >
              <PenTool size={14} className="mr-1" />
              Add diagram
            </button>
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="apiType" 
                checked={apiType === 'REST'} 
                onChange={() => updateApiType('REST')}
                className="mr-2 text-green-600 focus:ring-green-500" 
              />
              <span>REST</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="apiType" 
                checked={apiType === 'GraphQL'} 
                onChange={() => updateApiType('GraphQL')}
                className="mr-2 text-green-600 focus:ring-green-500" 
              />
              <span>GraphQL</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="apiType" 
                checked={apiType === 'gRPC'} 
                onChange={() => updateApiType('gRPC')}
                className="mr-2 text-green-600 focus:ring-green-500" 
              />
              <span>gRPC</span>
            </label>
          </div>
        </div>
        
        {/* API Endpoints */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">API Endpoints</h2>
          <p className="text-sm text-gray-600 mb-4">Define the endpoints your system exposes</p>
          
          <div className="space-y-4">
            {apis.map(api => (
              <div key={api.id} className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
                {/* API Header */}
                <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-300">
                  <div className="flex items-center space-x-3">
                    <select
                      value={api.method}
                      onChange={(e) => updateAPI(api.id, 'method', e.target.value)}
                      className="px-2 py-1 text-sm font-medium rounded border border-gray-300 bg-white focus:ring-green-500 focus:border-green-500"
                    >
                      {methods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={api.endpoint}
                      onChange={(e) => updateAPI(api.id, 'endpoint', e.target.value)}
                      placeholder="Endpoint path (e.g., /api/users)"
                      className="px-2 py-1 text-sm border border-gray-300 rounded w-64 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => toggleExpand(api.id)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {api.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button 
                      onClick={() => removeAPI(api.id)}
                      className="p-1 text-gray-500 hover:text-red-500 ml-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {/* API Details */}
                {api.expanded && (
                  <div className="p-4 space-y-4 bg-white">
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={api.description}
                        onChange={(e) => updateAPI(api.id, 'description', e.target.value)}
                        placeholder="What does this endpoint do?"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    {/* Request Parameters */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Request Parameters</label>
                      <div className="border border-gray-300 rounded overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 bg-gray-100 p-2 text-xs font-medium text-gray-700">
                          <div className="col-span-3">Name</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Required</div>
                          <div className="col-span-4">Description</div>
                          <div className="col-span-1"></div>
                        </div>
                        
                        {/* Parameters */}
                        {api.requestParams.map(param => (
                          <div key={param.id} className="grid grid-cols-12 gap-2 p-2 border-t border-gray-300">
                            <div className="col-span-3">
                              <input
                                type="text"
                                value={param.name}
                                onChange={(e) => updateRequestParam(api.id, param.id, 'name', e.target.value)}
                                placeholder="Parameter name"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                              />
                            </div>
                            <div className="col-span-2">
                              <select
                                value={param.type}
                                onChange={(e) => updateRequestParam(api.id, param.id, 'type', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="string">string</option>
                                <option value="number">number</option>
                                <option value="boolean">boolean</option>
                                <option value="object">object</option>
                                <option value="array">array</option>
                              </select>
                            </div>
                            <div className="col-span-2 flex items-center">
                              <input
                                type="checkbox"
                                checked={param.required}
                                onChange={(e) => updateRequestParam(api.id, param.id, 'required', e.target.checked)}
                                className="mr-2 rounded text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm">Required</span>
                            </div>
                            <div className="col-span-4">
                              <input
                                type="text"
                                value={param.description}
                                onChange={(e) => updateRequestParam(api.id, param.id, 'description', e.target.value)}
                                placeholder="Parameter description"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                              />
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button 
                                onClick={() => removeRequestParam(api.id, param.id)}
                                className="p-1 text-gray-500 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Parameter Button */}
                        <div className="p-2 border-t border-gray-300">
                          <button
                            onClick={() => addRequestParam(api.id)}
                            className="flex items-center text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            <Plus size={14} className="mr-1" />
                            Add Parameter
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Response Format */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Response Format</label>
                      <div className="flex">
                        <textarea
                          value={api.responseFormat}
                          onChange={(e) => updateAPI(api.id, 'responseFormat', e.target.value)}
                          placeholder="JSON response schema"
                          className="flex-1 h-32 px-3 py-2 text-sm border border-gray-300 rounded font-mono focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button 
            onClick={addAPI}
            className="mt-4 flex items-center text-sm text-green-600 hover:text-green-800 font-medium"
          >
            <Plus size={16} className="mr-1" />
            Add Endpoint
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAPIDesignPage;
