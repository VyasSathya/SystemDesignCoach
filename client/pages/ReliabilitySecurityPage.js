import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useWorkbook } from '../context/WorkbookContext';
import ProgressBar from '../components/ProgressBar';

const ReliabilitySecurityPage = ({ contextValue }) => {
  const workbookContext = contextValue || useWorkbook();

  if (!workbookContext) {
    return <div>Loading Reliability & Security...</div>;
  }
  const { state, dispatch, workbookService } = workbookContext;
  const { currentProblem, problems } = state;

  // Get data from context with default values
  const reliabilityData = problems[currentProblem]?.sections?.reliability || {
    reliabilityMetrics: [],
    failureScenarios: [],
    securityMeasures: [],
    patternDescription: '', // Add pattern description to initial state
    previewMode: false
  };

  // Local state
  const [reliabilityMetrics, setReliabilityMetrics] = useState(reliabilityData.reliabilityMetrics);
  const [failureScenarios, setFailureScenarios] = useState(reliabilityData.failureScenarios);
  const [securityMeasures, setSecurityMeasures] = useState(reliabilityData.securityMeasures);
  const [patternDescription, setPatternDescription] = useState(reliabilityData.patternDescription);
  const [previewMode, setPreviewMode] = useState(reliabilityData.previewMode);

  // Update effect when problem changes
  useEffect(() => {
    setReliabilityMetrics(reliabilityData.reliabilityMetrics);
    setFailureScenarios(reliabilityData.failureScenarios);
    setSecurityMeasures(reliabilityData.securityMeasures);
    setPatternDescription(reliabilityData.patternDescription);
    setPreviewMode(reliabilityData.previewMode);
  }, [currentProblem, problems]);

  // Centralized save function
  const saveData = async (updatedData) => {
    dispatch({
      type: 'UPDATE_SECTION_DATA',
      problemId: currentProblem,
      section: 'reliability',
      data: updatedData
    });

    if (workbookService) {
      try {
        await workbookService.saveAllData(
          currentProblem,
          'reliability',
          {
            sections: {
              reliability: updatedData
            }
          }
        );
      } catch (error) {
        console.error('Failed to save reliability data:', error);
      }
    }
  };

  // Add pattern description update function
  const updatePatternDescription = (value) => {
    const updatedData = {
      ...reliabilityData,
      patternDescription: value
    };
    setPatternDescription(value);
    saveData(updatedData);
  };

  // Handle adding a new reliability metric
  const addReliabilityMetric = () => {
    const newId = Math.max(...reliabilityMetrics.map(m => m.id || 0), 0) + 1;
    const newMetric = {
      id: newId,
      metric: '',
      target: '',
      notes: '',
      completed: false
    };

    const updatedMetrics = [...reliabilityMetrics, newMetric];
    const updatedData = {
      ...reliabilityData,
      reliabilityMetrics: updatedMetrics
    };
    
    setReliabilityMetrics(updatedMetrics);
    saveData(updatedData);
  };

  // Handle updating a reliability metric
  const updateReliabilityMetric = (id, field, value) => {
    const updatedMetrics = reliabilityMetrics.map(metric =>
      metric.id === id ? { ...metric, [field]: value } : metric
    );
    
    const updatedData = {
      ...reliabilityData,
      reliabilityMetrics: updatedMetrics
    };
    
    setReliabilityMetrics(updatedMetrics);
    saveData(updatedData);
  };

  // Handle deleting a reliability metric
  const deleteReliabilityMetric = (id) => {
    const updatedMetrics = reliabilityMetrics.filter(metric => metric.id !== id);
    
    const updatedData = {
      ...reliabilityData,
      reliabilityMetrics: updatedMetrics
    };
    
    setReliabilityMetrics(updatedMetrics);
    saveData(updatedData);
  };

  // Similar functions for failure scenarios
  const addFailureScenario = () => {
    const newId = Math.max(...failureScenarios.map(s => s.id), 0) + 1;
    const newScenario = {
      id: newId,
      scenario: '',
      impact: '',
      mitigation: '',
      completed: false
    };

    const updatedData = {
      ...reliabilityData,
      failureScenarios: [...failureScenarios, newScenario]
    };
    setFailureScenarios(updatedData.failureScenarios);
    saveData(updatedData);
  };

  const updateFailureScenario = (id, field, value) => {
    const updatedData = {
      ...reliabilityData,
      failureScenarios: failureScenarios.map(scenario =>
        scenario.id === id ? { ...scenario, [field]: value } : scenario
      )
    };
    setFailureScenarios(updatedData.failureScenarios);
    saveData(updatedData);
  };

  const deleteFailureScenario = (id) => {
    const updatedData = {
      ...reliabilityData,
      failureScenarios: failureScenarios.filter(scenario => scenario.id !== id)
    };
    setFailureScenarios(updatedData.failureScenarios);
    saveData(updatedData);
  };

  // Similar functions for security measures
  const addSecurityMeasure = () => {
    const newId = Math.max(...securityMeasures.map(m => m.id), 0) + 1;
    const newMeasure = {
      id: newId,
      measure: '',
      category: '',
      implementation: '',
      completed: false
    };

    const updatedData = {
      ...reliabilityData,
      securityMeasures: [...securityMeasures, newMeasure]
    };
    setSecurityMeasures(updatedData.securityMeasures);
    saveData(updatedData);
  };

  const updateSecurityMeasure = (id, field, value) => {
    const updatedMeasures = securityMeasures.map(measure =>
      measure.id === id ? { ...measure, [field]: value } : measure
    );
    
    const updatedData = {
      ...reliabilityData,
      securityMeasures: updatedMeasures
    };
    
    setSecurityMeasures(updatedMeasures);
    saveData(updatedData);
  };

  const deleteSecurityMeasure = (id) => {
    const updatedData = {
      ...reliabilityData,
      securityMeasures: securityMeasures.filter(measure => measure.id !== id)
    };
    setSecurityMeasures(updatedData.securityMeasures);
    saveData(updatedData);
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    const updatedData = {
      ...reliabilityData,
      previewMode: !previewMode
    };
    setPreviewMode(updatedData.previewMode);
    saveData(updatedData);
  };

  // Placeholder progress functions - to be refined later
  const calculateProgress = () => 0;
  const getCompletedSections = () => 0;
  const getTotalSections = () => 3; // Correct, no change needed

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with title and preview toggle only */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-red-600">Reliability & Security</h1>
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
      <div className="bg-red-50 border border-red-100 p-4 rounded-md text-red-700 text-sm mb-6">
        <strong className="font-medium">Coach tip:</strong> Define specific reliability targets with measurable metrics and create comprehensive failure scenarios with detailed mitigation strategies.
      </div>
      
      {/* Progress bar */}
      <div className="bg-white p-4 border rounded-md mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium">{calculateProgress()}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-full bg-red-500 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">{getCompletedSections()}</span> of <span className="font-medium">{getTotalSections()}</span> sections completed
        </div>
      </div>
      
      {/* Main content area */}
      <div className={previewMode ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}>
        {/* Left column: Content forms */}
        <div className="space-y-6">
          {/* Pattern Description section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-medium text-gray-800">Pattern Description</h2>
            </div>
            <div className="p-4">
              <textarea
                value={patternDescription}
                onChange={(e) => updatePatternDescription(e.target.value)}
                placeholder="Describe the reliability and security patterns used in your system..."
                className="w-full px-3 py-2 text-sm border rounded"
                rows="4"
              />
            </div>
          </div>

          {/* Reliability Metrics section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Reliability Metrics</h2>
              <button 
                onClick={addReliabilityMetric}
                className="text-red-600 text-sm font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Metric
              </button>
            </div>
            <div className="p-4">
              {reliabilityMetrics.map((metric) => (
                <div key={metric.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <input
                      type="text"
                      value={metric.metric}
                      onChange={(e) => updateReliabilityMetric(metric.id, 'metric', e.target.value)}
                      placeholder="Metric name"
                      className="w-full px-3 py-2 text-sm border rounded mr-2"
                    />
                    <button
                      onClick={() => deleteReliabilityMetric(metric.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={metric.target}
                    onChange={(e) => updateReliabilityMetric(metric.id, 'target', e.target.value)}
                    placeholder="Target value"
                    className="w-full px-3 py-2 text-sm border rounded mb-2"
                  />
                  <textarea
                    value={metric.notes}
                    onChange={(e) => updateReliabilityMetric(metric.id, 'notes', e.target.value)}
                    placeholder="Additional notes"
                    className="w-full px-3 py-2 text-sm border rounded"
                    rows="2"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Failure Scenarios section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Failure Scenarios</h2>
              <button 
                onClick={addFailureScenario}
                className="text-red-600 text-sm font-medium"
              >
                + Add Scenario
              </button>
            </div>
            <div className="p-4">
              {failureScenarios.map(scenario => (
                <div key={scenario.id} className="border p-3 rounded mb-3">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
                      <input
                        type="text"
                        value={scenario.component}
                        onChange={(e) => updateFailureScenario(scenario.id, 'component', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Scenario</label>
                      <input
                        type="text"
                        value={scenario.scenario}
                        onChange={(e) => updateFailureScenario(scenario.id, 'scenario', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mitigation</label>
                    <textarea
                      value={scenario.mitigation}
                      onChange={(e) => updateFailureScenario(scenario.id, 'mitigation', e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded bg-gray-50"
                      rows="2"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={() => deleteFailureScenario(scenario.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Security Measures section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Security Measures</h2>
              <button 
                onClick={addSecurityMeasure}
                className="text-red-600 text-sm font-medium"
              >
                + Add Measure
              </button>
            </div>
            <div className="p-4">
              {securityMeasures.map(measure => (
                <div key={measure.id} className="border p-3 rounded mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                      value={measure.type}
                      onChange={(e) => updateSecurityMeasure(measure.id, 'type', e.target.value)}
                    >
                      <option value="authentication">Authentication</option>
                      <option value="authorization">Authorization</option>
                      <option value="encryption">Encryption</option>
                      <option value="monitoring">Monitoring</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={measure.description}
                      onChange={(e) => updateSecurityMeasure(measure.id, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded"
                      rows="2"
                      placeholder="Describe the security measure..."
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button 
                      onClick={() => deleteSecurityMeasure(measure.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right column: Preview */}
        {previewMode && (
          <div className="space-y-6">
            <div className="bg-white border rounded-md overflow-hidden sticky top-6">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">Preview</h3>
              </div>
              <div className="p-4">
                {/* Pattern Description Preview */}
                {patternDescription && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold border-b pb-2 mb-3">Pattern Description</h4>
                    <p className="text-sm text-gray-600">{patternDescription}</p>
                  </div>
                )}

                {/* Reliability Metrics Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Reliability Metrics</h4>
                  <div className="space-y-3">
                    {reliabilityMetrics.map(metric => (
                      <div key={metric.id} className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-medium">{metric.metric}</h5>
                          <p className="text-xs text-gray-600">{metric.notes}</p>
                        </div>
                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                          {metric.target}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Failure Scenarios Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Failure Scenarios</h4>
                  <div className="space-y-3">
                    {failureScenarios.map(scenario => (
                      <div key={scenario.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-medium">{scenario.component}</h5>
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            Critical
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{scenario.scenario}</p>
                        <div className="mt-2 p-2 bg-green-50 rounded-md text-xs">
                          <span className="font-medium">Mitigation:</span> {scenario.mitigation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Measures Preview */}
                <div>
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Security Measures</h4>
                  <div className="space-y-3">
                    {securityMeasures.map(measure => (
                      <div key={measure.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <h5 className="text-sm font-medium">{measure.type}</h5>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Required
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{measure.description}</p>
                      </div>
                    ))}
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
