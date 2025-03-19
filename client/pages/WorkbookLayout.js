// pages/WorkbookLayout.js
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Code, 
  Database, 
  LayoutGrid as Layout, 
  BarChart, 
  Shield,
  Save,
  MessageSquare 
} from 'lucide-react';
import RequirementsPage from './RequirementsPage';
import APIDesignPage from './APIDesignPage';
import DataModelPage from './DataModelPage';
import SystemArchitecturePage from './SystemArchitecturePage';
import ScalingStrategyPage from './ScalingStrategyPage';
import ReliabilitySecurityPage from './ReliabilitySecurityPage';
import WorkbookPageWrapper from './WorkbookPageWrapper';

// The color mapping function for tabs
const getTabStyles = (tabId, isActive) => {
  switch(tabId) {
    case 'requirements':
      return isActive 
        ? "border-indigo-500 text-indigo-600" 
        : "text-gray-500 hover:text-indigo-700 hover:border-gray-300";
    case 'api':
      return isActive 
        ? "border-green-500 text-green-600" 
        : "text-gray-500 hover:text-green-700 hover:border-gray-300";
    case 'data':
      return isActive 
        ? "border-purple-500 text-purple-600" 
        : "text-gray-500 hover:text-purple-700 hover:border-gray-300";
    case 'architecture':
      return isActive 
        ? "border-blue-500 text-blue-600" 
        : "text-gray-500 hover:text-blue-700 hover:border-gray-300";
    case 'scaling':
      return isActive 
        ? "border-orange-500 text-orange-600" 
        : "text-gray-500 hover:text-orange-700 hover:border-gray-300";
    case 'reliability':
      return isActive 
        ? "border-red-500 text-red-600" 
        : "text-gray-500 hover:text-red-700 hover:border-gray-300";
    default:
      return isActive 
        ? "border-gray-500 text-gray-600" 
        : "text-gray-500 hover:text-gray-700 hover:border-gray-300";
  }
};

const WorkbookLayout = ({ onBack, sessionId }) => {
  // State management
  const [activeTab, setActiveTab] = useState('requirements');
  const [workbookState, setWorkbookState] = useState({
    diagrams: {
      system: {
        nodes: [],
        edges: [],
        mermaidCode: ''
      },
      sequence: {
        nodes: [],
        edges: [],
        mermaidCode: ''
      }
    }
  });
  
  const [formData, setFormData] = useState({
    requirements: {},
    api: {},
    data: {},
    architecture: {},
    scaling: {},
    reliability: {}
  });

  // Define tabs for navigation
  const tabs = [
    { id: 'requirements', label: 'Requirements', icon: <ClipboardList size={18} /> },
    { id: 'api', label: 'API Design', icon: <Code size={18} /> },
    { id: 'data', label: 'Data Model', icon: <Database size={18} /> },
    { id: 'architecture', label: 'Architecture', icon: <Layout size={18} /> },
    { id: 'scaling', label: 'Scaling Strategy', icon: <BarChart size={18} /> },
    { id: 'reliability', label: 'Reliability & Security', icon: <Shield size={18} /> }
  ];

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleSaveAndContinue = async () => {
    // Get the next tab index
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextTab = tabs[currentIndex + 1];
    
    if (nextTab) {
      setActiveTab(nextTab.id);
    }
  };

  const getActivePageComponent = () => {
    const commonProps = {
      sessionId,
      onSaveAndContinue: handleSaveAndContinue
    };

    switch (activeTab) {
      case 'requirements':
        return <RequirementsPage 
          {...commonProps}
          data={formData.requirements} 
          updateData={(data) => updateFormData('requirements', data)} 
        />;
      case 'api':
        return <APIDesignPage 
          {...commonProps}
          data={formData.api} 
          updateData={(data) => updateFormData('api', data)} 
        />;
      case 'data':
        return <DataModelPage 
          {...commonProps}
          data={formData.data} 
          updateData={(data) => updateFormData('data', data)} 
        />;
      case 'architecture':
        return <SystemArchitecturePage 
          {...commonProps}
          data={formData.architecture} 
          updateData={(data) => updateFormData('architecture', data)} 
        />;
      case 'scaling':
        return <ScalingStrategyPage 
          {...commonProps}
          data={formData.scaling} 
          updateData={(data) => updateFormData('scaling', data)} 
        />;
      case 'reliability':
        return <ReliabilitySecurityPage 
          {...commonProps}
          data={formData.reliability} 
          updateData={(data) => updateFormData('reliability', data)} 
        />;
      default:
        return <RequirementsPage 
          {...commonProps}
          data={formData.requirements} 
          updateData={(data) => updateFormData('requirements', data)} 
        />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with back button */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
                <MessageSquare size={16} className="mr-2" />
                Ask Coach
              </button>
              <button className="flex items-center px-4 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
                <Save size={16} className="mr-2" />
                Save Progress
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-4 text-sm font-medium relative ${
                  activeTab === tab.id
                    ? `border-b-2 ${getTabStyles(tab.id, true)}`
                    : getTabStyles(tab.id, false)
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {getActivePageComponent()}
        </div>
      </main>
    </div>
  );
};

export default WorkbookLayout;