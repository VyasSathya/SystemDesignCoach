import React, { useState } from 'react';

const ReliabilitySecurityPage = () => {
  const [previewMode, setPreviewMode] = useState(true);
  
  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-red-600">Reliability & Security</h1>
        <div className="flex space-x-3">
          <button 
            onClick={togglePreview}
            className={`px-3 py-1.5 text-sm border rounded ${
              previewMode ? 'bg-gray-100' : 'bg-white'
            }`}
          >
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button className="px-3 py-1.5 text-sm border rounded bg-white">
            Save Changes
          </button>
          <button className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded">
            Ask Coach
          </button>
        </div>
      </div>
      
      {/* Coach tip */}
      <div className="bg-red-50 border border-red-100 p-4 rounded-md text-red-700 text-sm mb-6">
        <strong className="font-medium">Coach tip:</strong> Define specific reliability targets with measurable metrics and create comprehensive failure scenarios with detailed mitigation strategies.
      </div>
      
      {/* Progress bar */}
      <div className="bg-white p-4 border rounded-md mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium">67%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full bg-red-500 rounded-full" style={{ width: '67%' }}></div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">4</span> of <span className="font-medium">6</span> sections completed
        </div>
      </div>
      
      {/* Main content area */}
      <div className={previewMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
        {/* Left column: Content forms */}
        <div className="space-y-6">
          {/* Reliability Targets section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Reliability Targets</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full bg-red-400" style={{ width: '100%' }}></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">100%</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 border p-3 rounded">
                  <div className="col-span-3">
                    <input
                      type="text"
                      defaultValue="Availability"
                      placeholder="Metric"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex">
                      <input
                        type="text"
                        defaultValue="99.9"
                        placeholder="Value"
                        className="w-full px-2 py-1 text-sm border rounded-l"
                      />
                      <span className="bg-gray-100 px-2 py-1 border border-l-0 rounded-r text-sm">%</span>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      defaultValue="Maximum 8.76 hours downtime per year"
                      placeholder="Notes"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center items-center">
                    <button className="text-red-500 hover:text-red-700">
                      <span>×</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-2 border p-3 rounded">
                  <div className="col-span-3">
                    <input
                      type="text"
                      defaultValue="Response Time"
                      placeholder="Metric"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex">
                      <input
                        type="text"
                        defaultValue="200"
                        placeholder="Value"
                        className="w-full px-2 py-1 text-sm border rounded-l"
                      />
                      <span className="bg-gray-100 px-2 py-1 border border-l-0 rounded-r text-sm">ms</span>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      defaultValue="P95 latency"
                      placeholder="Notes"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center items-center">
                    <button className="text-red-500 hover:text-red-700">
                      <span>×</span>
                    </button>
                  </div>
                </div>
                
                <button className="flex items-center text-sm text-red-600">
                  <span className="mr-1">+</span> Add Reliability Metric
                </button>
              </div>
            </div>
          </div>
          
          {/* Failure Scenarios section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Failure Scenarios</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full bg-red-400" style={{ width: '75%' }}></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">75%</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="border p-3 rounded mb-3">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
                    <input
                      type="text"
                      defaultValue="Database"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Scenario</label>
                    <input
                      type="text"
                      defaultValue="Primary database becomes unavailable"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mitigation</label>
                  <textarea
                    defaultValue="Automatic failover to standby replica with maximum 30 second recovery time"
                    className="w-full px-2 py-1 text-sm border rounded"
                    rows="2"
                  />
                </div>
              </div>
              
              <button className="flex items-center text-sm text-red-600">
                <span className="mr-1">+</span> Add Failure Scenario
              </button>
            </div>
          </div>
          
          {/* Security Measures section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Security Measures</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full bg-red-400" style={{ width: '67%' }}></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">67%</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2 border-b pb-2">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <select
                      defaultValue="Authentication"
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    >
                      <option>Authentication</option>
                      <option>Input Validation</option>
                      <option>Data Encryption</option>
                    </select>
                    <textarea
                      defaultValue="JWT tokens with short expiration and refresh token rotation"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 border-b pb-2">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <select
                      defaultValue="Data Encryption"
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    >
                      <option>Authentication</option>
                      <option>Input Validation</option>
                      <option>Data Encryption</option>
                    </select>
                    <textarea
                      defaultValue="TLS 1.3 for all connections, AES-256 for data at rest"
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
                
                <button className="flex items-center text-sm text-red-600">
                  <span className="mr-1">+</span> Add Security Measure
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Preview */}
        {previewMode && (
          <div>
            <div className="bg-white border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">Live Preview</h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {/* Reliability preview */}
                  <div className="border rounded">
                    <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                      <span className="text-sm font-medium">Reliability Targets</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Preview</span>
                    </div>
                    <div className="p-3">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-3 py-2">Availability</td>
                            <td className="px-3 py-2 font-mono">99.9%</td>
                            <td className="px-3 py-2 text-gray-500">8.76 hours downtime per year</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">Response Time</td>
                            <td className="px-3 py-2 font-mono">200 ms</td>
                            <td className="px-3 py-2 text-gray-500">P95 latency</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Security preview */}
                  <div className="border rounded">
                    <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                      <span className="text-sm font-medium">Security Measures</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Preview</span>
                    </div>
                    <div className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-xs">✓</div>
                          <div>
                            <h4 className="font-medium">Authentication</h4>
                            <p className="text-sm text-gray-600">JWT tokens with short expiration and refresh token rotation</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">○</div>
                          <div>
                            <h4 className="font-medium">Data Encryption</h4>
                            <p className="text-sm text-gray-600">TLS 1.3 for all connections, AES-256 for data at rest</p>
                          </div>
                        </div>
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
  );
};

export default ReliabilitySecurityPage;
