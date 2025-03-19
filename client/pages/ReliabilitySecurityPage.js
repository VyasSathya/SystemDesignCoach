import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useWorkbook } from '../context/WorkbookContext';
import ProgressBar from '../components/ProgressBar';

const ReliabilitySecurityPage = () => {
  const { state, dispatch } = useWorkbook();
  const { currentProblem, problems } = state;
  
  // Get data from context
  const reliabilityData = problems[currentProblem]?.sections?.reliability || {
    reliabilityMetrics: [],
    failureScenarios: [],
    securityMeasures: [],
    previewMode: false
  };

  // Initialize state from context data
  const [reliabilityMetrics, setReliabilityMetrics] = useState(reliabilityData.reliabilityMetrics);
  const [failureScenarios, setFailureScenarios] = useState(reliabilityData.failureScenarios);
  const [securityMeasures, setSecurityMeasures] = useState(reliabilityData.securityMeasures);
  const [previewMode, setPreviewMode] = useState(reliabilityData.previewMode);

  // Save state when data changes
  useEffect(() => {
    if (currentProblem) {
      dispatch({
        type: 'UPDATE_SECTION_DATA',
        problemId: currentProblem,
        section: 'reliability',
        data: {
          reliabilityMetrics,
          failureScenarios,
          securityMeasures,
          previewMode
        }
      });
    }
  }, [reliabilityMetrics, failureScenarios, securityMeasures, previewMode]);

  // Placeholder progress functions - to be refined later
  const calculateProgress = () => 0;
  const getCompletedSections = () => 0;
  const getTotalSections = () => 3; // Correct, no change needed

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const addReliabilityMetric = () => {
    const newId = Math.max(0, ...reliabilityMetrics.map(m => m.id)) + 1;
    setReliabilityMetrics([...reliabilityMetrics, {
      id: newId,
      metric: '',
      target: '',
      notes: '',
      completed: false
    }]);
  };

  const deleteReliabilityMetric = (id) => {
    setReliabilityMetrics(reliabilityMetrics.filter(m => m.id !== id));
  };

  const addFailureScenario = () => {
    const newId = Math.max(0, ...failureScenarios.map(f => f.id)) + 1;
    setFailureScenarios([...failureScenarios, {
      id: newId,
      component: '',
      scenario: '',
      mitigation: '',
      completed: false
    }]);
  };

  const deleteFailureScenario = (id) => {
    setFailureScenarios(failureScenarios.filter(f => f.id !== id));
  };

  const addSecurityMeasure = () => {
    const newId = Math.max(0, ...securityMeasures.map(s => s.id)) + 1;
    setSecurityMeasures([...securityMeasures, {
      id: newId,
      type: 'Authentication',
      description: '',
      completed: false
    }]);
  };

  const deleteSecurityMeasure = (id) => {
    setSecurityMeasures(securityMeasures.filter(s => s.id !== id));
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with title and preview toggle only */}
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
          {/* Reliability Targets section */}
          <div className="bg-white border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Reliability Targets</h2>
              <button 
                onClick={addReliabilityMetric}
                className="text-red-600 text-sm font-medium"
              >
                + Add Metric
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {reliabilityMetrics.map(metric => (
                  <div key={metric.id} className="grid grid-cols-12 gap-2 border p-3 rounded">
                    <div className="col-span-3">
                      <input
                        type="text"
                        defaultValue={metric.metric}
                        placeholder="Metric"
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex">
                        <input
                          type="text"
                          defaultValue={metric.target}
                          placeholder="Value"
                          className="w-full px-2 py-1 text-sm border rounded-l"
                        />
                        <span className="bg-gray-100 px-2 py-1 border border-l-0 rounded-r text-sm">%</span>
                      </div>
                    </div>
                    <div className="col-span-6">
                      <input
                        type="text"
                        defaultValue={metric.notes}
                        placeholder="Notes"
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center items-center">
                      <button 
                        onClick={() => deleteReliabilityMetric(metric.id)}
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
                    <select className="w-full px-2 py-1 text-sm border rounded mb-2">
                      <option value="authentication" selected={measure.type === 'Authentication'}>Authentication</option>
                      <option value="authorization" selected={measure.type === 'Authorization'}>Authorization</option>
                      <option value="encryption" selected={measure.type === 'Encryption'}>Encryption</option>
                      <option value="monitoring" selected={measure.type === 'Monitoring'}>Monitoring</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      defaultValue={measure.description}
                      className="w-full px-2 py-1 text-sm border rounded"
                      rows="2"
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
                {/* Reliability Metrics Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold border-b pb-2 mb-3">Reliability Targets</h4>
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
