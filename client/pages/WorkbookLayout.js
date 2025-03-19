// WorkbookLayout.js
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Code, 
  Database, 
  Layout, 
  BarChart, 
  Shield,
  Save,
  MessageSquare,
  ArrowLeft,
  AlertCircle 
} from 'lucide-react';
import { workbookService } from '../services/workbookService';

// Import page components
import RequirementsPage from './RequirementsPage';
import APIDesignPage from './APIDesignPage';
import DataModelPage from './DataModelPage';
import SystemArchitecturePage from './SystemArchitecturePage';
import ScalingStrategyPage from './ScalingStrategyPage';
import ReliabilitySecurityPage from './ReliabilitySecurityPage';

const WorkbookLayout = ({ onBack, sessionId }) => {
  // State for active tab and data
  const [activeTab, setActiveTab] = useState('requirements');
  const [formData, setFormData] = useState({
    requirements: {},
    api: {},
    data: {},
    architecture: {},
    scaling: {},
    reliability: {}
  });
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [isDirty, setIsDirty] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [tabProgress, setTabProgress] = useState({
    requirements: 0,
    api: 0,
    data: 0,
    architecture: 0,
    scaling: 0,
    reliability: 0
  });

  // Load saved data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await workbookService.saveAllData(sessionId);
        if (savedData) {
          setFormData(savedData.sections || {});
          calculateProgress(savedData.sections);
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    };
    
    loadData();
  }, [sessionId]);

  // Update form data for a specific section
  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
    setIsDirty(true);
  };

  // Handle save
  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      await workbookService.saveAllData(
        sessionId,
        activeTab,
        {
          sections: formData
        }
      );
      
      calculateProgress(formData);
      setSaveStatus('saved');
      setIsDirty(false);
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save data:', error);
      setSaveStatus('error');
    }
  };

  // Auto-save when data changes
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        handleSave();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [formData, isDirty]);

  // Calculate progress based on data
  const calculateProgress = (data = formData) => {
    const progressByTab = {
      requirements: calculateTabProgress(data.requirements),
      api: calculateTabProgress(data.api),
      data: calculateTabProgress(data.data),
      architecture: calculateTabProgress(data.architecture),
      scaling: calculateTabProgress(data.scaling),
      reliability: calculateTabProgress(data.reliability)
    };
    
    const overall = Object.values(progressByTab).reduce((sum, val) => sum + val, 0) / Object.keys(progressByTab).length;
    
    setTabProgress(progressByTab);
    setOverallProgress(Math.round(overall));
  };
  
  // Helper to calculate progress for a tab
  const calculateTabProgress = (tabData) => {
    if (!tabData || Object.keys(tabData).length === 0) return 0;
    
    // Count non-empty fields and calculate percentage
    const fields = Object.values(tabData);
    const filledFields = fields.filter(field => {
      if (typeof field === 'string') {
        return field.trim().length > 0;
      }
      return field !== null && field !== undefined;
    });
    
    return Math.round((filledFields.length / fields.length) * 100);
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    if (isDirty) {
      handleSave();
    }
    
    setActiveTab(tabId);
  };

  // Continue to next tab
  const handleSaveAndContinue = () => {
    const tabs = ['requirements', 'api', 'data', 'architecture', 'scaling', 'reliability'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex < tabs.length - 1) {
      handleSave();
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  // Tab styles with color mapping
  const getTabStyles = (tabId) => {
    const isActive = activeTab === tabId;
    const baseStyle = "flex items-center py-4 px-4 text-sm font-medium rounded-lg transition-colors";
    
    const tabColors = {
      requirements: isActive 
        ? "bg-indigo-100 text-indigo-700 border-indigo-500" 
        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-700",
      api: isActive 
        ? "bg-green-100 text-green-700 border-green-500" 
        : "text-gray-500 hover:bg-green-50 hover:text-green-700",
      data: isActive 
        ? "bg-purple-100 text-purple-700 border-purple-500" 
        : "text-gray-500 hover:bg-purple-50 hover:text-purple-700",
      architecture: isActive 
        ? "bg-blue-100 text-blue-700 border-blue-500" 
        : "text-gray-500 hover:bg-blue-50 hover:text-blue-700",
      scaling: isActive 
        ? "bg-orange-100 text-orange-700 border-orange-500" 
        : "text-gray-500 hover:bg-orange-50 hover:text-orange-700",
      reliability: isActive 
        ? "bg-red-100 text-red-700 border-red-500" 
        : "text-gray-500 hover:bg-red-50 hover:text-red-700"
    };
    
    return `${baseStyle} ${tabColors[tabId] || ""}`;
  };

  // Tab icon mapping
  const tabIcons = {
    requirements: <ClipboardList size={18} />,
    api: <Code size={18} />,
    data: <Database size={18} />,
    architecture: <Layout size={18} />,
    scaling: <BarChart size={18} />,
    reliability: <Shield size={18} />
  };

  // Render active page based on current tab
  const renderActivePage = () => {
    const commonProps = {
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
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Dashboard
            </button>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors">
                <MessageSquare size={16} className="mr-2" />
                Ask Coach
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-700 border-t-transparent rounded-full mr-2"></div>
                ) : saveStatus === 'saved' ? (
                  <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
                ) : saveStatus === 'error' ? (
                  <AlertCircle size={16} className="mr-2 text-red-500" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : 'Save Progress'}
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="py-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="mt-1 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {['requirements', 'api', 'data', 'architecture', 'scaling', 'reliability'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={getTabStyles(tab)}
              >
                <span className="mr-2">{tabIcons[tab]}</span>
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                {tabProgress[tab] === 100 && (
                  <span className="ml-2 h-2 w-2 bg-green-500 rounded-full" />
                )}
                {isDirty && activeTab === tab && (
                  <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActivePage()}
        </div>
      </main>
    </div>
  );
};

export default WorkbookLayout;
