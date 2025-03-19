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
import { useWorkbook } from '../context/WorkbookContext';

// The color mapping function for tabs
const getTabStyles = (tabId, isActive) => {
  const baseStyle = "flex items-center py-4 px-4 text-sm font-medium rounded-lg transition-colors";
  
  switch(tabId) {
    case 'requirements':
      return `${baseStyle} ${isActive 
        ? "bg-indigo-100 text-indigo-700 border-indigo-500" 
        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"}`;
    case 'api':
      return `${baseStyle} ${isActive 
        ? "bg-green-100 text-green-700 border-green-500" 
        : "text-gray-500 hover:bg-green-50 hover:text-green-700"}`;
    case 'data':
      return `${baseStyle} ${isActive 
        ? "bg-purple-100 text-purple-700 border-purple-500" 
        : "text-gray-500 hover:bg-purple-50 hover:text-purple-700"}`;
    case 'architecture':
      return `${baseStyle} ${isActive 
        ? "bg-blue-100 text-blue-700 border-blue-500" 
        : "text-gray-500 hover:bg-blue-50 hover:text-blue-700"}`;
    case 'scaling':
      return `${baseStyle} ${isActive 
        ? "bg-orange-100 text-orange-700 border-orange-500" 
        : "text-gray-500 hover:bg-orange-50 hover:text-orange-700"}`;
    case 'reliability':
      return `${baseStyle} ${isActive 
        ? "bg-red-100 text-red-700 border-red-500" 
        : "text-gray-500 hover:bg-red-50 hover:text-red-700"}`;
    default:
      return `${baseStyle} ${isActive 
        ? "bg-gray-100 text-gray-700" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`;
  }
};

const WorkbookLayout = ({ onBack, sessionId }) => {
  const { state, dispatch, markPageAsSaved } = useWorkbook();
  const [isSaving, setIsSaving] = useState(false);

  const saveCurrentPageState = async () => {
    if (!state.activePage) return;
    
    setIsSaving(true);
    try {
      const currentPageData = {
        pageId: state.activePage,
        content: state.pages[state.activePage].content,
        diagrams: state.diagrams[state.activePage] || {},
        lastModified: new Date().toISOString()
      };

      await workbookService.savePage(
        sessionId,
        state.activePage,
        currentPageData
      );

      markPageAsSaved(state.activePage);
    } catch (error) {
      console.error('Failed to save page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save when switching tabs if current page is dirty
  const handleTabChange = async (newTabId) => {
    if (state.pages[state.activePage]?.isDirty) {
      await saveCurrentPageState();
    }
    dispatch({ type: 'SET_ACTIVE_PAGE', page: newTabId });
  };

  // Auto-save dirty pages
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (state.pages[state.activePage]?.isDirty) {
        saveCurrentPageState();
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [state.activePage, state.pages]);

  const tabs = [
    { id: 'requirements', label: 'Requirements', icon: <ClipboardList size={18} /> },
    { id: 'api', label: 'API Design', icon: <Code size={18} /> },
    { id: 'data', label: 'Data Model', icon: <Database size={18} /> },
    { id: 'architecture', label: 'Architecture', icon: <Layout size={18} /> },
    { id: 'scaling', label: 'Scaling Strategy', icon: <BarChart size={18} /> },
    { id: 'reliability', label: 'Reliability & Security', icon: <Shield size={18} /> }
  ];

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
            {isSaving && (
              <span className="ml-2 text-gray-500">
                Saving...
              </span>
            )}
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
                onClick={() => handleTabChange(tab.id)}
                className={getTabStyles(tab.id, state.activePage === tab.id)}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
                {state.pages[tab.id]?.isDirty && (
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
          {getActivePageComponent()}
        </div>
      </main>
    </div>
  );
};

export default WorkbookLayout;
