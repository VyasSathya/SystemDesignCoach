import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { useWorkbook } from '../context/WorkbookContext';

const ScalingStrategyPage = ({ contextValue }) => {
  const workbookContext = contextValue || useWorkbook();

  if (!workbookContext) {
    return <div>Loading Scaling Strategy...</div>;
  }
  const { state, dispatch, workbookService } = workbookContext;
  const { currentProblem, problems } = state;

  // Initialize data from context
  const scalingData = problems[currentProblem]?.sections?.scaling || {
    strategies: [],
    bottlenecks: [],
    metrics: [],
    capacityPlanning: {
      currentLoad: '',
      projectedGrowth: '',
      scalingTriggers: '',
      costConsiderations: ''
    },
    previewMode: false
  };

  // Initialize all state variables
  const [strategies, setStrategies] = useState(scalingData.strategies);
  const [bottlenecks, setBottlenecks] = useState(scalingData.bottlenecks);
  const [metrics, setMetrics] = useState(scalingData.metrics);
  const [previewMode, setPreviewMode] = useState(scalingData.previewMode);

  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Save data function
  const saveData = async (updatedData) => {
    dispatch({
      type: 'UPDATE_SECTION_DATA',
      problemId: currentProblem,
      section: 'scaling',
      data: updatedData
    });

    if (workbookService) {
      try {
        await workbookService.saveAllData(currentProblem, 'scaling', {
          sections: {
            scaling: updatedData
          }
        });
      } catch (error) {
        console.error('Failed to save scaling data:', error);
      }
    }
  };

  // Update effect
  useEffect(() => {
    setStrategies(scalingData.strategies);
    setBottlenecks(scalingData.bottlenecks);
    setMetrics(scalingData.metrics);
    setPreviewMode(scalingData.previewMode);
  }, [currentProblem, problems]);

  // Helper function to generate unique IDs
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Strategy management functions
  const addStrategy = () => {
    const newStrategy = {
      id: generateId(),
      component: '',
      type: 'horizontal',
      description: '',
      details: ''
    };
    const updatedData = {
      ...scalingData,
      strategies: [...scalingData.strategies, newStrategy]
    };
    saveData(updatedData);
  };

  const updateStrategy = (id, field, value) => {
    const updatedData = {
      ...scalingData,
      strategies: scalingData.strategies.map(strategy =>
        strategy.id === id ? { ...strategy, [field]: value } : strategy
      )
    };
    saveData(updatedData);
  };

  const deleteStrategy = (id) => {
    const updatedData = {
      ...scalingData,
      strategies: scalingData.strategies.filter(strategy => strategy.id !== id)
    };
    saveData(updatedData);
  };

  // Bottleneck management functions
  const addBottleneck = () => {
    const newBottleneck = {
      id: generateId(),
      component: '',
      priority: 'medium',
      issue: '',
      solution: ''
    };
    const updatedData = {
      ...scalingData,
      bottlenecks: [...scalingData.bottlenecks, newBottleneck]
    };
    saveData(updatedData);
  };

  const updateBottleneck = (id, field, value) => {
    const updatedData = {
      ...scalingData,
      bottlenecks: scalingData.bottlenecks.map(bottleneck =>
        bottleneck.id === id ? { ...bottleneck, [field]: value } : bottleneck
      )
    };
    saveData(updatedData);
  };

  const deleteBottleneck = (id) => {
    const updatedData = {
      ...scalingData,
      bottlenecks: scalingData.bottlenecks.filter(bottleneck => bottleneck.id !== id)
    };
    saveData(updatedData);
  };

  // Metric management functions
  const addMetric = () => {
    const newMetric = {
      id: generateId(),
      name: '',
      target: '',
      current: '',
      notes: ''
    };
    const updatedData = {
      ...scalingData,
      metrics: [...scalingData.metrics, newMetric]
    };
    saveData(updatedData);
  };

  const updateMetric = (id, field, value) => {
    const updatedData = {
      ...scalingData,
      metrics: scalingData.metrics.map(metric =>
        metric.id === id ? { ...metric, [field]: value } : metric
      )
    };
    saveData(updatedData);
  };

  const deleteMetric = (id) => {
    const updatedData = {
      ...scalingData,
      metrics: scalingData.metrics.filter(metric => metric.id !== id)
    };
    saveData(updatedData);
  };

  // Capacity planning update function
  const updateCapacityPlanning = (field, value) => {
    const updatedData = {
      ...scalingData,
      capacityPlanning: {
        ...scalingData.capacityPlanning,
        [field]: value
      }
    };
    saveData(updatedData);
  };

  // Progress calculation functions
  const calculateProgress = () => {
    // Add your progress calculation logic here
    return 0;
  };

  const getCompletedSections = () => {
    // Add your completed sections calculation logic here
    return 0;
  };

  const getTotalSections = () => {
    return 4;
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-orange-600">Scaling Strategy</h1>
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
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-md text-orange-700 text-sm mb-6">
        <strong className="font-medium">Coach tip:</strong> Plan for horizontal scaling where possible, as it tends to be more resilient than vertical scaling. Identify potential bottlenecks early and have strategies to address them.
      </div>
      
      {/* Progress bar */}
      <div className="bg-white p-4 border rounded-md mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium">{calculateProgress()}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-orange-500 rounded-full" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">{getCompletedSections()}</span> of <span className="font-medium">{getTotalSections()}</span> sections completed
        </div>
      </div>
      
      {/* Main content area */}
      <div className={previewMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
        {/* Left column: Scaling strategy forms */}
        <div className="space-y-6">
          {/* Scaling Strategies */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Scaling Strategies</h2>
              <button 
                onClick={addStrategy}
                className="text-orange-600 text-sm font-medium"
              >
                + Add Strategy
              </button>
            </div>
            <div className="p-4">
              {strategies.map(strategy => (
                <div key={strategy.id} className="border p-3 rounded mb-3">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
                      <input
                        type="text"
                        value={strategy.component || ''}
                        onChange={(e) => updateStrategy(strategy.id, 'component', e.target.value)}
                        placeholder="e.g., API Services, Database"
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={strategy.type || ''}
                        onChange={(e) => updateStrategy(strategy.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                      >
                        <option value="horizontal">Horizontal Scaling</option>
                        <option value="vertical">Vertical Scaling</option>
                        <option value="database">Database Scaling</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Strategy Description</label>
                    <textarea
                      value={strategy.description || ''}
                      onChange={(e) => updateStrategy(strategy.id, 'description', e.target.value)}
                      placeholder="Describe the scaling strategy..."
                      className="w-full px-2 py-1 text-sm border rounded"
                      rows={2}
                    />
                  </div>
                  
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Implementation Details</label>
                    <textarea
                      value={strategy.details || ''}
                      onChange={(e) => updateStrategy(strategy.id, 'details', e.target.value)}
                      placeholder="Specific implementation steps and triggers..."
                      className="w-full px-2 py-1 text-sm border rounded"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => deleteStrategy(strategy.id)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottlenecks */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Bottlenecks</h2>
              <button 
                onClick={addBottleneck}
                className="text-orange-600 text-sm font-medium"
              >
                + Add Bottleneck
              </button>
            </div>
            <div className="p-4">
              {bottlenecks.map(bottleneck => (
                <div key={bottleneck.id} className="border p-3 rounded mb-3">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
                      <input
                        type="text"
                        value={bottleneck.component || ''}
                        onChange={(e) => updateBottleneck(bottleneck.id, 'component', e.target.value)}
                        placeholder="e.g., Database, Cache"
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={bottleneck.priority || ''}
                        onChange={(e) => updateBottleneck(bottleneck.id, 'priority', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Issue Description</label>
                    <textarea
                      value={bottleneck.issue || ''}
                      onChange={(e) => updateBottleneck(bottleneck.id, 'issue', e.target.value)}
                      placeholder="Describe the bottleneck..."
                      className="w-full px-2 py-1 text-sm border rounded"
                      rows={2}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Solution</label>
                    <textarea
                      value={bottleneck.solution || ''}
                      onChange={(e) => updateBottleneck(bottleneck.id, 'solution', e.target.value)}
                      placeholder="Proposed solution..."
                      className="w-full px-2 py-1 text-sm border rounded"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => deleteBottleneck(bottleneck.id)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Performance Metrics</h2>
              <button 
                onClick={addMetric}
                className="text-orange-600 text-sm font-medium"
              >
                + Add Metric
              </button>
            </div>
            <div className="p-4">
              {metrics.map(metric => (
                <div key={metric.id} className="border p-3 rounded mb-3">
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Metric Name</label>
                      <input
                        type="text"
                        value={metric.name || ''}
                        onChange={(e) => updateMetric(metric.id, 'name', e.target.value)}
                        placeholder="e.g., Response Time"
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Target Value</label>
                      <input
                        type="text"
                        value={metric.target || ''}
                        onChange={(e) => updateMetric(metric.id, 'target', e.target.value)}
                        placeholder="e.g., 200ms"
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Current Value</label>
                      <input
                        type="text"
                        value={metric.current || ''}
                        onChange={(e) => updateMetric(metric.id, 'current', e.target.value)}
                        placeholder="e.g., 180ms"
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      value={metric.notes || ''}
                      onChange={(e) => updateMetric(metric.id, 'notes', e.target.value)}
                      placeholder="Any additional context or notes..."
                      className="w-full px-2 py-1 text-sm border rounded"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => deleteMetric(metric.id)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Capacity Planning */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-medium text-gray-800">Capacity Planning</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Load</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  value={scalingData.capacityPlanning?.currentLoad || ''}
                  onChange={(e) => {
                    const updatedData = {
                      ...scalingData,
                      capacityPlanning: {
                        ...scalingData.capacityPlanning,
                        currentLoad: e.target.value
                      }
                    };
                    saveData(updatedData);
                  }}
                  placeholder="Describe current system load, e.g., requests per second, daily active users"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projected Growth</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  value={scalingData.capacityPlanning?.projectedGrowth || ''}
                  onChange={(e) => {
                    const updatedData = {
                      ...scalingData,
                      capacityPlanning: {
                        ...scalingData.capacityPlanning,
                        projectedGrowth: e.target.value
                      }
                    };
                    saveData(updatedData);
                  }}
                  placeholder="Describe expected growth, e.g., user growth, data storage needs"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scaling Triggers</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  value={scalingData.capacityPlanning?.scalingTriggers || ''}
                  onChange={(e) => {
                    const updatedData = {
                      ...scalingData,
                      capacityPlanning: {
                        ...scalingData.capacityPlanning,
                        scalingTriggers: e.target.value
                      }
                    };
                    saveData(updatedData);
                  }}
                  placeholder="Describe conditions for scaling, e.g., CPU utilization, memory usage, response time"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Considerations</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border rounded-md"
                  value={scalingData.capacityPlanning?.costConsiderations || ''}
                  onChange={(e) => {
                    const updatedData = {
                      ...scalingData,
                      capacityPlanning: {
                        ...scalingData.capacityPlanning,
                        costConsiderations: e.target.value
                      }
                    };
                    saveData(updatedData);
                  }}
                  placeholder="Describe cost considerations, e.g., reserved instances, spot instances, cost projections"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Preview */}
        {previewMode && (
          <div className="space-y-6">
            <div className="bg-white border rounded-md overflow-hidden sticky top-6">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">Scaling Strategy Preview</h3>
              </div>
              <div className="p-4">
                <div className="mb-6">
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Scaling Strategies</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-orange-500 pl-3">
                      <div className="flex justify-between items-start">
                        <h5 className="text-sm font-medium">API Services - Horizontal Scaling</h5>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Implemented</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Add more instances behind load balancer</p>
                      <p className="text-xs text-gray-500 mt-1">Use auto-scaling based on CPU utilization (over 70%) and request count</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-3">
                      <div className="flex justify-between items-start">
                        <h5 className="text-sm font-medium">Database - Vertical Scaling</h5>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">Planned</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Increase database instance size</p>
                      <p className="text-xs text-gray-500 mt-1">Scale up when memory usage exceeds 80 percent or disk IO is high</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Bottlenecks & Solutions</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <h5 className="text-sm font-medium">Database</h5>
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">High Priority</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">High read query volume during peak hours</p>
                      <div className="mt-2 p-2 bg-green-50 rounded-md text-xs">
                        <span className="font-medium">Solution:</span> Implement read replicas and connection pooling
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Performance Metrics</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span className="font-medium">Response Time</span>
                            <div className="text-xs text-gray-500">P95 API response time</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">200 ms</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">180 ms</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Met</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span className="font-medium">Throughput</span>
                            <div className="text-xs text-gray-500">Maximum requests per second</div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">1000 req/s</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">850 req/s</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">In Progress</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Capacity Planning</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-medium">Current Load</h5>
                      <p className="text-gray-600 text-xs">Average 500 req/s with peaks of 850 req/s during business hours. 10,000 daily active users.</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Projected Growth</h5>
                      <p className="text-gray-600 text-xs">20 percent user growth expected in next quarter. 50 percent increase in data storage needs annually.</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Scaling Triggers</h5>
                      <p className="text-gray-600 text-xs">CPU utilization above 70 percent for 5 minutes, memory usage above 80 percent, response time above 300ms</p>
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

export default ScalingStrategyPage;
