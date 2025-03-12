import React, { useState } from 'react';
import { MessageSquare, Save, ChevronDown, ChevronUp, Check, Plus, Trash2, PenTool } from 'lucide-react';

const EnhancedScalingStrategyPage = ({ data = {}, updateData }) => {
  // Preserve original state management for functionality
  const [sections, setSections] = useState(
    data.sections ? JSON.parse(data.sections) : [
      {
        id: 'traffic',
        title: 'Traffic Estimation',
        description: 'Estimate the scale and volume of your system',
        expanded: true,
        fields: [
          { id: 'dau', label: 'Daily Active Users (DAU)', value: '', unit: 'users' },
          { id: 'requestsPerUser', label: 'Requests per user per day', value: '', unit: 'requests' },
          { id: 'peakQPS', label: 'Peak QPS (Queries Per Second)', value: '', unit: 'QPS' }
        ]
      },
      {
        id: 'storage',
        title: 'Storage Requirements',
        description: 'Calculate how much data you need to store',
        expanded: false,
        fields: [
          { id: 'objectSize', label: 'Average object size', value: '', unit: 'KB' },
          { id: 'dailyNewData', label: 'New data per day', value: '', unit: 'GB' },
          { id: 'retentionPeriod', label: 'Data retention period', value: '', unit: 'days' },
          { id: 'totalStorage', label: 'Total storage needed', value: '', unit: 'TB' }
        ]
      },
      {
        id: 'bandwidth',
        title: 'Bandwidth Estimation',
        description: 'Estimate inbound and outbound network traffic',
        expanded: false,
        fields: [
          { id: 'inboundTraffic', label: 'Inbound traffic per day', value: '', unit: 'GB' },
          { id: 'outboundTraffic', label: 'Outbound traffic per day', value: '', unit: 'GB' },
          { id: 'peakBandwidth', label: 'Peak bandwidth requirement', value: '', unit: 'Mbps' }
        ]
      },
      {
        id: 'memory',
        title: 'Memory Requirements',
        description: 'Estimate cache and working memory needs',
        expanded: false,
        fields: [
          { id: 'cacheSize', label: 'Total cache size', value: '', unit: 'GB' },
          { id: 'cacheHitRate', label: 'Target cache hit rate', value: '', unit: '%' }
        ]
      }
    ]
  );

  const [strategies, setStrategies] = useState(
    data.strategies ? JSON.parse(data.strategies) : [
      {
        id: 'horizontal',
        title: 'Horizontal Scaling',
        applied: false,
        description: '',
        components: []
      },
      {
        id: 'vertical',
        title: 'Vertical Scaling',
        applied: false,
        description: '',
        components: []
      },
      {
        id: 'caching',
        title: 'Caching Strategy',
        applied: false,
        description: '',
        layers: []
      },
      {
        id: 'database',
        title: 'Database Scaling',
        applied: false,
        description: '',
        techniques: []
      }
    ]
  );

  const [bottlenecks, setBottlenecks] = useState(
    data.bottlenecks ? JSON.parse(data.bottlenecks) : [
      { id: 1, description: '', solution: '' }
    ]
  );

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded } 
        : section
    );
    setSections(updatedSections);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        sections: JSON.stringify(updatedSections)
      });
    }
  };

  // Update field value
  const updateFieldValue = (sectionId, fieldId, value) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            fields: section.fields.map(field => 
              field.id === fieldId ? { ...field, value } : field
            )
          } 
        : section
    );
    setSections(updatedSections);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        sections: JSON.stringify(updatedSections)
      });
    }
  };

  // Toggle a scaling strategy's applied status
  const toggleStrategy = (strategyId) => {
    const updatedStrategies = strategies.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, applied: !strategy.applied } 
        : strategy
    );
    setStrategies(updatedStrategies);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        strategies: JSON.stringify(updatedStrategies)
      });
    }
  };

  // Update strategy description
  const updateStrategyDescription = (strategyId, description) => {
    const updatedStrategies = strategies.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, description } 
        : strategy
    );
    setStrategies(updatedStrategies);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        strategies: JSON.stringify(updatedStrategies)
      });
    }
  };

  // Add a component to a strategy
  const addStrategyComponent = (strategyId) => {
    const updatedStrategies = strategies.map(strategy => {
      if (strategy.id === strategyId) {
        return {
          ...strategy,
          components: [
            ...strategy.components,
            { id: Date.now(), name: '', details: '' }
          ]
        };
      }
      return strategy;
    });
    
    setStrategies(updatedStrategies);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        strategies: JSON.stringify(updatedStrategies)
      });
    }
  };

  // Update a component in a strategy
  const updateStrategyComponent = (strategyId, componentId, field, value) => {
    const updatedStrategies = strategies.map(strategy => {
      if (strategy.id === strategyId) {
        return {
          ...strategy,
          components: strategy.components.map(component => 
            component.id === componentId 
              ? { ...component, [field]: value } 
              : component
          )
        };
      }
      return strategy;
    });
    
    setStrategies(updatedStrategies);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        strategies: JSON.stringify(updatedStrategies)
      });
    }
  };

  // Remove a component from a strategy
  const removeStrategyComponent = (strategyId, componentId) => {
    const updatedStrategies = strategies.map(strategy => {
      if (strategy.id === strategyId) {
        return {
          ...strategy,
          components: strategy.components.filter(component => component.id !== componentId)
        };
      }
      return strategy;
    });
    
    setStrategies(updatedStrategies);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        strategies: JSON.stringify(updatedStrategies)
      });
    }
  };

  // Add a bottleneck
  const addBottleneck = () => {
    const updatedBottlenecks = [
      ...bottlenecks,
      { id: Date.now(), description: '', solution: '' }
    ];
    
    setBottlenecks(updatedBottlenecks);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        bottlenecks: JSON.stringify(updatedBottlenecks)
      });
    }
  };

  // Update a bottleneck
  const updateBottleneck = (bottleneckId, field, value) => {
    const updatedBottlenecks = bottlenecks.map(bottleneck => 
      bottleneck.id === bottleneckId 
        ? { ...bottleneck, [field]: value } 
        : bottleneck
    );
    
    setBottlenecks(updatedBottlenecks);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        bottlenecks: JSON.stringify(updatedBottlenecks)
      });
    }
  };

  // Remove a bottleneck
  const removeBottleneck = (bottleneckId) => {
    const updatedBottlenecks = bottlenecks.filter(bottleneck => bottleneck.id !== bottleneckId);
    
    setBottlenecks(updatedBottlenecks);
    
    // Update parent component's data
    if (updateData) {
      updateData({
        ...data,
        bottlenecks: JSON.stringify(updatedBottlenecks)
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Coach tip box */}
        <div className="bg-orange-50 border border-orange-100 rounded-md p-4 text-sm text-orange-700">
          <strong className="font-medium">Coach tip:</strong> Focus on concrete metrics when estimating scale. Consider growth projections over time and identify potential bottlenecks early in your design.
        </div>
        
        {/* Estimations Sections */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Scale Estimations</h2>
            <button 
              className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center"
              onClick={() => {/* Add diagram functionality */}}
            >
              <PenTool size={14} className="mr-1" />
              Add diagram
            </button>
          </div>
          
          <div className="space-y-4">
            {sections.map(section => (
              <div key={section.id} className="border border-gray-300 rounded-md shadow-sm">
                <div 
                  className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <div>
                    {section.expanded ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </div>
                </div>
                
                {section.expanded && (
                  <div className="p-3 border-t border-gray-300 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map(field => (
                        <div key={field.id} className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                          <div className="flex">
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter value"
                            />
                            <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Scaling Strategies */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Scaling Approaches</h2>
          
          <div className="space-y-4">
            {strategies.map(strategy => (
              <div key={strategy.id} className="border border-gray-300 rounded-md overflow-hidden shadow-sm">
                <div className="p-3 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mt-0.5 mr-3">
                        <button 
                          onClick={() => toggleStrategy(strategy.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center ${
                            strategy.applied ? 'bg-orange-500 text-white' : 'border border-gray-300'
                          }`}
                        >
                          {strategy.applied && <Check size={14} />}
                        </button>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{strategy.title}</h3>
                        <textarea
                          value={strategy.description}
                          onChange={(e) => updateStrategyDescription(strategy.id, e.target.value)}
                          placeholder={`Describe your ${strategy.title.toLowerCase()} approach...`}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {strategy.applied && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Components to Scale</h4>
                      
                      {strategy.components.map(component => (
                        <div key={component.id} className="flex items-start mb-2">
                          <input
                            type="text"
                            value={component.name}
                            onChange={(e) => updateStrategyComponent(strategy.id, component.id, 'name', e.target.value)}
                            placeholder="Component name"
                            className="w-48 px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          />
                          <input
                            type="text"
                            value={component.details}
                            onChange={(e) => updateStrategyComponent(strategy.id, component.id, 'details', e.target.value)}
                            placeholder="How to scale this component"
                            className="flex-1 px-3 py-2 border-t border-b border-r border-gray-300 text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          />
                          <button 
                            onClick={() => removeStrategyComponent(strategy.id, component.id)}
                            className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => addStrategyComponent(strategy.id)}
                        className="flex items-center text-xs text-orange-600 hover:text-orange-800 mt-2 font-medium"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Component
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottlenecks and Solutions */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Potential Bottlenecks & Solutions</h2>
          
          <div className="space-y-4">
            {bottlenecks.map(bottleneck => (
              <div key={bottleneck.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-md p-4 bg-white shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bottleneck</label>
                  <textarea
                    value={bottleneck.description}
                    onChange={(e) => updateBottleneck(bottleneck.id, 'description', e.target.value)}
                    placeholder="Describe a potential bottleneck"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solution</label>
                  <textarea
                    value={bottleneck.solution}
                    onChange={(e) => updateBottleneck(bottleneck.id, 'solution', e.target.value)}
                    placeholder="Describe your solution"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    rows="3"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    onClick={() => removeBottleneck(bottleneck.id)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addBottleneck}
              className="flex items-center text-sm text-orange-600 hover:text-orange-800 mt-2 font-medium"
            >
              <Plus size={16} className="mr-1" />
              Add Another Bottleneck
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="border-t border-gray-200 p-4 flex justify-between">
        <button className="flex items-center px-4 py-2 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors">
          <MessageSquare size={16} className="mr-2" />
          Ask Coach
        </button>
        <button className="flex items-center px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors shadow-sm">
          <Save size={16} className="mr-2" />
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default EnhancedScalingStrategyPage;