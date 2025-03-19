import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, X } from 'lucide-react';

const APIEndpointCard = ({ api, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(api.expanded || false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  return (
    <div className="border p-3 rounded mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="API Endpoint (e.g., /api/users)"
            value={api.endpoint}
            onChange={(e) => onUpdate({ endpoint: e.target.value })}
            className="w-full text-lg font-medium border-0 focus:ring-0 p-0"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={api.method}
            onChange={(e) => onUpdate({ method: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {methods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={api.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-md"
              placeholder="Describe the purpose of this API endpoint..."
            />
          </div>

          {/* Request Parameters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Parameters
            </label>
            <div className="space-y-2">
              {(api.requestParams || []).map((param, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => {
                      const newParams = [...api.requestParams];
                      newParams[index] = { ...param, name: e.target.value };
                      onUpdate({ requestParams: newParams });
                    }}
                    placeholder="Parameter name"
                    className="flex-1 border border-gray-300 rounded-md"
                  />
                  <select
                    value={param.type}
                    onChange={(e) => {
                      const newParams = [...api.requestParams];
                      newParams[index] = { ...param, type: e.target.value };
                      onUpdate({ requestParams: newParams });
                    }}
                    className="border border-gray-300 rounded-md"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object</option>
                    <option value="array">Array</option>
                  </select>
                  <button
                    onClick={() => {
                      const newParams = api.requestParams.filter((_, i) => i !== index);
                      onUpdate({ requestParams: newParams });
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newParams = [...(api.requestParams || []), { name: '', type: 'string' }];
                  onUpdate({ requestParams: newParams });
                }}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus size={16} className="mr-1" />
                Add Parameter
              </button>
            </div>
          </div>

          {/* Response Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response Format
            </label>
            <textarea
              value={api.responseFormat}
              onChange={(e) => onUpdate({ responseFormat: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-md font-mono text-sm"
              placeholder="{ 'data': { ... } }"
            />
          </div>
        </div>
      )}
      {/* Move trash can to bottom and make it red */}
      <div className="mt-2 flex justify-end">
        <button 
          onClick={() => onDelete(api.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default APIEndpointCard;
