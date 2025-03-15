import React, { useState } from 'react';
import { MessageSquare, Save, ChevronDown, ChevronUp, Plus, Trash2, Shield, Activity, PenTool } from 'lucide-react';

const ReliabilitySecurityPage = ({ data = {}, updateData }) => {
  // Reliability state
  const [reliabilityTargets, setReliabilityTargets] = useState(
    data.reliabilityTargets ? JSON.parse(data.reliabilityTargets) : [
      { id: 1, metric: 'Availability', target: '99.9', unit: '%', notes: 'Maximum 8.76 hours downtime per year' },
      { id: 2, metric: 'Response Time', target: '200', unit: 'ms', notes: 'P95 latency' }
    ]
  );
  
  const [failureScenarios, setFailureScenarios] = useState(
    data.failureScenarios ? JSON.parse(data.failureScenarios) : [
      { id: 1, component: '', scenario: '', mitigation: '' }
    ]
  );
  
  // Security state
  const [authMethods, setAuthMethods] = useState(
    data.authMethods ? JSON.parse(data.authMethods) : {
      jwt: false,
      oauth: false,
      apiKey: false,
      sessionCookie: false,
      custom: false,
      customDetails: ''
    }
  );
  
  const [dataProtection, setDataProtection] = useState(
    data.dataProtection ? JSON.parse(data.dataProtection) : {
      encryption: {
        inTransit: false,
        atRest: false,
        endToEnd: false,
        notes: ''
      },
      accessControl: {
        rbac: false,
        acl: false,
        customPolicy: false,
        notes: ''
      }
    }
  );
  
  const [securityMeasures, setSecurityMeasures] = useState(
    data.securityMeasures ? JSON.parse(data.securityMeasures) : [
      { id: 1, type: 'Input Validation', implemented: false, details: '' }
    ]
  );
  
  const [complianceRequirements, setComplianceRequirements] = useState(
    data.complianceRequirements ? JSON.parse(data.complianceRequirements) : [
      { id: 1, standard: '', requirements: '', implemented: false }
    ]
  );
  
  // Reliability section handlers
  const addReliabilityTarget = () => {
    const newId = reliabilityTargets.length > 0 
      ? Math.max(...reliabilityTargets.map(t => t.id)) + 1 
      : 1;
    
    const updatedTargets = [
      ...reliabilityTargets,
      { id: newId, metric: '', target: '', unit: '', notes: '' }
    ];
    setReliabilityTargets(updatedTargets);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        reliabilityTargets: JSON.stringify(updatedTargets)
      });
    }
  };
  
  const updateReliabilityTarget = (id, field, value) => {
    const updatedTargets = reliabilityTargets.map(target => 
      target.id === id ? { ...target, [field]: value } : target
    );
    setReliabilityTargets(updatedTargets);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        reliabilityTargets: JSON.stringify(updatedTargets)
      });
    }
  };
  
  const removeReliabilityTarget = (id) => {
    const updatedTargets = reliabilityTargets.filter(target => target.id !== id);
    setReliabilityTargets(updatedTargets);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        reliabilityTargets: JSON.stringify(updatedTargets)
      });
    }
  };
  
  const addFailureScenario = () => {
    const newId = failureScenarios.length > 0 
      ? Math.max(...failureScenarios.map(s => s.id)) + 1 
      : 1;
    
    const updatedScenarios = [
      ...failureScenarios,
      { id: newId, component: '', scenario: '', mitigation: '' }
    ];
    setFailureScenarios(updatedScenarios);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        failureScenarios: JSON.stringify(updatedScenarios)
      });
    }
  };
  
  const updateFailureScenario = (id, field, value) => {
    const updatedScenarios = failureScenarios.map(scenario => 
      scenario.id === id ? { ...scenario, [field]: value } : scenario
    );
    setFailureScenarios(updatedScenarios);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        failureScenarios: JSON.stringify(updatedScenarios)
      });
    }
  };
  
  const removeFailureScenario = (id) => {
    const updatedScenarios = failureScenarios.filter(scenario => scenario.id !== id);
    setFailureScenarios(updatedScenarios);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        failureScenarios: JSON.stringify(updatedScenarios)
      });
    }
  };
  
  // Security section handlers
  const updateAuthMethod = (method, value) => {
    const updatedAuthMethods = {
      ...authMethods,
      [method]: value
    };
    setAuthMethods(updatedAuthMethods);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        authMethods: JSON.stringify(updatedAuthMethods)
      });
    }
  };
  
  const updateDataProtection = (category, field, value) => {
    const updatedDataProtection = {
      ...dataProtection,
      [category]: {
        ...dataProtection[category],
        [field]: value
      }
    };
    setDataProtection(updatedDataProtection);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        dataProtection: JSON.stringify(updatedDataProtection)
      });
    }
  };
  
  const addSecurityMeasure = () => {
    const newId = securityMeasures.length > 0 
      ? Math.max(...securityMeasures.map(m => m.id)) + 1 
      : 1;
    
    const updatedMeasures = [
      ...securityMeasures,
      { id: newId, type: '', implemented: false, details: '' }
    ];
    
    setSecurityMeasures(updatedMeasures);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        securityMeasures: JSON.stringify(updatedMeasures)
      });
    }
  };
  
  const updateSecurityMeasure = (id, field, value) => {
    const updatedMeasures = securityMeasures.map(measure => 
      measure.id === id ? { ...measure, [field]: value } : measure
    );
    setSecurityMeasures(updatedMeasures);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        securityMeasures: JSON.stringify(updatedMeasures)
      });
    }
  };
  
  const removeSecurityMeasure = (id) => {
    const updatedMeasures = securityMeasures.filter(measure => measure.id !== id);
    setSecurityMeasures(updatedMeasures);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        securityMeasures: JSON.stringify(updatedMeasures)
      });
    }
  };
  
  const addComplianceRequirement = () => {
    const newId = complianceRequirements.length > 0 
      ? Math.max(...complianceRequirements.map(r => r.id)) + 1 
      : 1;
    
    const updatedRequirements = [
      ...complianceRequirements,
      { id: newId, standard: '', requirements: '', implemented: false }
    ];
    
    setComplianceRequirements(updatedRequirements);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        complianceRequirements: JSON.stringify(updatedRequirements)
      });
    }
  };
  
  const updateComplianceRequirement = (id, field, value) => {
    const updatedRequirements = complianceRequirements.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    );
    setComplianceRequirements(updatedRequirements);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        complianceRequirements: JSON.stringify(updatedRequirements)
      });
    }
  };
  
  const removeComplianceRequirement = (id) => {
    const updatedRequirements = complianceRequirements.filter(req => req.id !== id);
    setComplianceRequirements(updatedRequirements);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        complianceRequirements: JSON.stringify(updatedRequirements)
      });
    }
  };
  
  // UI state
  const [expandedSections, setExpandedSections] = useState(
    data.expandedSections ? JSON.parse(data.expandedSections) : {
      reliabilityTargets: true,
      failureScenarios: true,
      authMethods: true,
      dataProtection: true,
      securityMeasures: true,
      compliance: true
    }
  );
  
  const toggleSection = (section) => {
    const updatedSections = {
      ...expandedSections,
      [section]: !expandedSections[section]
    };
    setExpandedSections(updatedSections);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        expandedSections: JSON.stringify(updatedSections)
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Coach tip box */}
        <div className="bg-red-50 border border-red-100 rounded-md p-4 text-sm text-red-700">
          <strong className="font-medium">Coach tip:</strong> Define specific reliability targets with measurable metrics and create comprehensive failure scenarios with detailed mitigation strategies.
        </div>
      
        {/* Reliability Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Reliability & Availability</h2>
            </div>
            <button 
              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
              onClick={() => {/* Add diagram functionality */}}
            >
              <PenTool size={14} className="mr-1" />
              Add diagram
            </button>
          </div>
          
          {/* Reliability Targets */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('reliabilityTargets')}
            >
              <h3 className="text-md font-medium text-gray-700">Reliability Targets</h3>
              {expandedSections.reliabilityTargets ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </div>
            
            {expandedSections.reliabilityTargets && (
              <div className="mt-2 space-y-3">
                {reliabilityTargets.map(target => (
                  <div key={target.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={target.metric}
                        onChange={(e) => updateReliabilityTarget(target.id, 'metric', e.target.value)}
                        placeholder="Metric"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex">
                        <input
                          type="text"
                          value={target.target}
                          onChange={(e) => updateReliabilityTarget(target.id, 'target', e.target.value)}
                          placeholder="Value"
                          className="w-full px-3 py-2 border border-gray-300 rounded-l text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        />
                        <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r text-sm text-gray-500">
                          <input
                            type="text"
                            value={target.unit}
                            onChange={(e) => updateReliabilityTarget(target.id, 'unit', e.target.value)}
                            placeholder="unit"
                            className="w-10 bg-transparent border-none p-0 text-sm text-center focus:ring-0"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={target.notes}
                        onChange={(e) => updateReliabilityTarget(target.id, 'notes', e.target.value)}
                        placeholder="Notes"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button 
                        onClick={() => removeReliabilityTarget(target.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addReliabilityTarget}
                  className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  <Plus size={16} className="mr-1" />
                  Add Reliability Metric
                </button>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded mt-2">
                  <p className="font-medium mb-1">Common reliability targets:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Availability (uptime): 99.9% to 99.999%</li>
                    <li>Latency: P95, P99 response times</li>
                    <li>Error Rate: % of failed requests</li>
                    <li>Recovery Time (RTO/RPO): Minutes/hours/data loss limits</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Failure Scenarios */}
          <div>
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('failureScenarios')}
            >
              <h3 className="text-md font-medium text-gray-700">Failure Scenarios & Mitigations</h3>
              {expandedSections.failureScenarios ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </div>
            
            {expandedSections.failureScenarios && (
              <div className="mt-2 space-y-3">
                {failureScenarios.map(scenario => (
                  <div key={scenario.id} className="border border-gray-300 rounded-md p-3 bg-white shadow-sm">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Component/Service</label>
                        <input
                          type="text"
                          value={scenario.component}
                          onChange={(e) => updateFailureScenario(scenario.id, 'component', e.target.value)}
                          placeholder="Which component can fail?"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div className="col-span-8">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Failure Scenario</label>
                        <input
                          type="text"
                          value={scenario.scenario}
                          onChange={(e) => updateFailureScenario(scenario.id, 'scenario', e.target.value)}
                          placeholder="What could go wrong?"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div className="col-span-12">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Mitigation Strategy</label>
                        <textarea
                          value={scenario.mitigation}
                          onChange={(e) => updateFailureScenario(scenario.id, 'mitigation', e.target.value)}
                          placeholder="How will you handle this failure?"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                          rows="2"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button 
                        onClick={() => removeFailureScenario(scenario.id)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addFailureScenario}
                  className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  <Plus size={16} className="mr-1" />
                  Add Failure Scenario
                </button>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded mt-2">
                  <p className="font-medium mb-1">Common failure scenarios to consider:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Service instance failure</li>
                    <li>Network partitions</li>
                    <li>Database unavailability</li>
                    <li>Region/zone outages</li>
                    <li>Dependency failures</li>
                    <li>Traffic spikes/DDoS</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Security Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Security & Privacy</h2>
          </div>
          
          {/* Authentication Methods */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('authMethods')}
            >
              <h3 className="text-md font-medium text-gray-700">Authentication & Authorization</h3>
              {expandedSections.authMethods ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </div>
            
            {expandedSections.authMethods && (
              <div className="mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Authentication Methods</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={authMethods.jwt}
                          onChange={(e) => updateAuthMethod('jwt', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 mr-2"
                        />
                        <span className="text-sm">JWT Tokens</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={authMethods.oauth}
                          onChange={(e) => updateAuthMethod('oauth', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 mr-2"
                        />
                        <span className="text-sm">OAuth 2.0</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={authMethods.apiKey}
                          onChange={(e) => updateAuthMethod('apiKey', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 mr-2"
                        />
                        <span className="text-sm">API Keys</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={authMethods.sessionCookie}
                          onChange={(e) => updateAuthMethod('sessionCookie', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 mr-2"
                        />
                        <span className="text-sm">Session Cookies</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={authMethods.custom}
                          onChange={(e) => updateAuthMethod('custom', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 mr-2"
                        />
                        <span className="text-sm">Custom Solution</span>
                      </label>
                      
                      {authMethods.custom && (
                        <textarea
                          value={authMethods.customDetails}
                          onChange={(e) => updateAuthMethod('customDetails', e.target.value)}
                          placeholder="Describe your custom authentication method"
                          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                          rows="2"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Authorization Strategy</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dataProtection.accessControl.rbac}
                          onChange={(e) => updateDataProtection('accessControl', 'rbac', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 mr-2"
                        />
                        <span className="text-sm">Role-Based Access Control (RBAC)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dataProtection.accessControl.acl}
                          onChange={(e) => updateDataProtection('accessControl', 'acl', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 mr-2"
                        />
                        <span className="text-sm">Access Control Lists (ACL)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dataProtection.accessControl.customPolicy}
                          onChange={(e) => updateDataProtection('accessControl', 'customPolicy', e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 mr-2"
                        />
                        <span className="text-sm">Custom Policy Engine</span>
                      </label>
                      
                      <textarea
                        value={dataProtection.accessControl.notes}
                        onChange={(e) => updateDataProtection('accessControl', 'notes', e.target.value)}
                        placeholder="Additional notes about authorization"
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Data Protection */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('dataProtection')}
            >
              <h3 className="text-md font-medium text-gray-700">Data Protection</h3>
              {expandedSections.dataProtection ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </div>
            
            {expandedSections.dataProtection && (
              <div className="mt-2 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Encryption Strategies</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dataProtection.encryption.inTransit}
                      onChange={(e) => updateDataProtection('encryption', 'inTransit', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 mr-2"
                    />
                    <span className="text-sm">Encryption in Transit (TLS/SSL)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dataProtection.encryption.atRest}
                      onChange={(e) => updateDataProtection('encryption', 'atRest', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 mr-2"
                    />
                    <span className="text-sm">Encryption at Rest</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={dataProtection.encryption.endToEnd}
                      onChange={(e) => updateDataProtection('encryption', 'endToEnd', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 mr-2"
                    />
                    <span className="text-sm">End-to-End Encryption</span>
                  </label>
                  
                  <textarea
                    value={dataProtection.encryption.notes}
                    onChange={(e) => updateDataProtection('encryption', 'notes', e.target.value)}
                    placeholder="Additional notes about encryption"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    rows="2"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Security Measures */}
          <div className="mb-6">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('securityMeasures')}
            >
              <h3 className="text-md font-medium text-gray-700">Security Measures</h3>
              {expandedSections.securityMeasures ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </div>
            
            {expandedSections.securityMeasures && (
              <div className="mt-2 space-y-3 relative">
                {securityMeasures.map(measure => (
                  <div key={measure.id} className="flex items-start space-x-2 border-b border-gray-200 pb-2">
                    <input
                      type="checkbox"
                      checked={measure.implemented}
                      onChange={(e) => updateSecurityMeasure(measure.id, 'implemented', e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <select
                        value={measure.type}
                        onChange={(e) => updateSecurityMeasure(measure.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select security measure...</option>
                        <option value="authentication">Authentication</option>
                        <option value="authorization">Authorization</option>
                        <option value="encryption">Encryption</option>
                        <option value="firewall">Firewall</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="backup">Backup & Recovery</option>
                        <option value="compliance">Compliance</option>
                      </select>
                      <textarea
                        value={measure.details}
                        onChange={(e) => updateSecurityMeasure(measure.id, 'details', e.target.value)}
                        placeholder="Implementation details"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <button 
                      onClick={() => removeSecurityMeasure(measure.id)}
                      className="text-red-500 hover:text-red-700 mt-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={addSecurityMeasure}
                  className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  <Plus size={16} className="mr-1" />
                  Add Security Measure
                </button>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded mt-2 absolute right-0" style={{ width: '400px' }}>
                  <p className="font-medium mb-1">Common security measures to consider:</p>
                  <ul className="grid grid-cols-2 gap-1 list-disc list-inside">
                    <li>Input validation</li>
                    <li>Rate limiting</li>
                    <li>WAF (Web App Firewall)</li>
                    <li>DDoS protection</li>
                    <li>Audit logging</li>
                    <li>Secure dependencies</li>
                    <li>CSRF protection</li>
                    <li>XSS prevention</li>
                    <li>SQL injection prevention</li>
                    <li>Secret management</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Compliance */}
          <div>
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('compliance')}
            >
              <h3 className="text-md font-medium text-gray-700">Compliance Requirements</h3>
              {expandedSections.compliance ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </div>
            
            {expandedSections.compliance && (
              <div className="mt-2 space-y-3">
                {complianceRequirements.map(req => (
                  <div key={req.id} className="flex items-start space-x-2 border-b border-gray-200 pb-2">
                    <input
                      type="checkbox"
                      checked={req.implemented}
                      onChange={(e) => updateComplianceRequirement(req.id, 'implemented', e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500 mt-1"
                    />
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={req.standard}
                          onChange={(e) => updateComplianceRequirement(req.id, 'standard', e.target.value)}
                          placeholder="Standard/Regulation"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={req.requirements}
                          onChange={(e) => updateComplianceRequirement(req.id, 'requirements', e.target.value)}
                          placeholder="Specific requirements"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeComplianceRequirement(req.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={addComplianceRequirement}
                  className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  <Plus size={16} className="mr-1" />
                  Add Compliance Requirement
                </button>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded mt-2">
                  <p className="font-medium mb-1">Common compliance standards:</p>
                  <ul className="grid grid-cols-2 gap-1 list-disc list-inside">
                    <li>GDPR (EU data privacy)</li>
                    <li>CCPA/CPRA (California)</li>
                    <li>HIPAA (Healthcare)</li>
                    <li>PCI DSS (Payment)</li>
                    <li>SOC 2 (Security)</li>
                    <li>ISO 27001 (Security)</li>
                    <li>NIST (Federal)</li>
                    <li>FedRAMP (Federal Cloud)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="border-t border-gray-200 p-4 flex justify-between">
        <button className="flex items-center px-4 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors">
          <MessageSquare size={16} className="mr-2" />
          Ask Coach
        </button>
        <button className="flex items-center px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm">
          <Save size={16} className="mr-2" />
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default ReliabilitySecurityPage;