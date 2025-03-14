// pages/WorkbookLayout.js
import React, { useState } from 'react';
import { ClipboardList, Database, Code, Layout, BarChart, Shield, MessageSquare, LogOut, Menu, X, User, Save, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import ExperienceLevelSelector from '../components/ExperienceLevelSelector';
import ConciseModeToggle from '../components/ConciseModeToggle';
import { getEvaluation } from '../utils/api';

// Import page components from the correct location
// If they're directly in the pages directory:
import RequirementsPage from './RequirementsPage';
import APIDesignPage from './APIDesignPage';
import DataModelPage from './DataModelPage';
import SystemArchitecturePage from './SystemArchitecturePage';
import ScalingStrategyPage from './ScalingStrategyPage';
import ReliabilitySecurityPage from './ReliabilitySecurityPage';

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

// The mobile menu styles
const getMobileTabStyles = (tabId, isActive) => {
  switch(tabId) {
    case 'requirements':
      return isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    case 'api':
      return isActive ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    case 'data':
      return isActive ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    case 'architecture':
      return isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    case 'scaling':
      return isActive ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    case 'reliability':
      return isActive ? "bg-red-50 text-red-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    default:
      return isActive ? "bg-gray-50 text-gray-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  }
};

// The coach button styles
const getCoachButtonStyles = (tabId) => {
  switch(tabId) {
    case 'requirements':
      return "bg-indigo-600 hover:bg-indigo-700";
    case 'api':
      return "bg-green-600 hover:bg-green-700";
    case 'data':
      return "bg-purple-600 hover:bg-purple-700";
    case 'architecture':
      return "bg-blue-600 hover:bg-blue-700";
    case 'scaling':
      return "bg-orange-600 hover:bg-orange-700";
    case 'reliability':
      return "bg-red-600 hover:bg-red-700";
    default:
      return "bg-gray-600 hover:bg-gray-700";
  }
};

// The progress bar style
const getProgressBarStyles = (tabId) => {
  switch(tabId) {
    case 'requirements':
      return "bg-indigo-600";
    case 'api':
      return "bg-green-600";
    case 'data':
      return "bg-purple-600";
    case 'architecture':
      return "bg-blue-600";
    case 'scaling':
      return "bg-orange-600";
    case 'reliability':
      return "bg-red-600";
    default:
      return "bg-gray-600";
  }
};

// Export button style
const getExportButtonStyles = (tabId) => {
  switch(tabId) {
    case 'requirements':
      return "text-indigo-600 hover:text-indigo-800";
    case 'api':
      return "text-green-600 hover:text-green-800";
    case 'data':
      return "text-purple-600 hover:text-purple-800";
    case 'architecture':
      return "text-blue-600 hover:text-blue-800";
    case 'scaling':
      return "text-orange-600 hover:text-orange-800";
    case 'reliability':
      return "text-red-600 hover:text-red-800";
    default:
      return "text-gray-600 hover:text-gray-800";
  }
};

// Coach panel background style
const getCoachPanelBgStyle = (tabId) => {
  switch(tabId) {
    case 'requirements':
      return "bg-indigo-50";
    case 'api':
      return "bg-green-50";
    case 'data':
      return "bg-purple-50";
    case 'architecture':
      return "bg-blue-50";
    case 'scaling':
      return "bg-orange-50";
    case 'reliability':
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
};

// Coach panel text style
const getCoachPanelTextStyle = (tabId) => {
  switch(tabId) {
    case 'requirements':
      return "text-indigo-700";
    case 'api':
      return "text-green-700";
    case 'data':
      return "text-purple-700";
    case 'architecture':
      return "text-blue-700";
    case 'scaling':
      return "text-orange-700";
    case 'reliability':
      return "text-red-700";
    default:
      return "text-gray-700";
  }
};

// Coach input focus style
const getCoachInputFocusStyle = (tabId) => {
  switch(tabId) {
    case 'requirements':
      return "focus:ring-indigo-500";
    case 'api':
      return "focus:ring-green-500";
    case 'data':
      return "focus:ring-purple-500";
    case 'architecture':
      return "focus:ring-blue-500";
    case 'scaling':
      return "focus:ring-orange-500";
    case 'reliability':
      return "focus:ring-red-500";
    default:
      return "focus:ring-gray-500";
  }
};

const WorkbookLayout = ({ onBack, sessionId }) => {
  const [activeTab, setActiveTab] = useState('requirements');
  const [showCoach, setShowCoach] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userLevel, setUserLevel] = useState('mid-level');
  const [conciseMode, setConciseMode] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [progressPercent, setProgressPercent] = useState(35);
  const [isSaving, setIsSaving] = useState(false);
  const [workbookName, setWorkbookName] = useState('E-commerce Platform Design');
  const [workbookTags, setWorkbookTags] = useState('e-commerce, scalability, web');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  
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
  
  // Mock function for updating form data
  const updateFormData = (section, data) => {
    setFormData({
      ...formData,
      [section]: data
    });
  };
  
  const getActivePageComponent = () => {
    switch (activeTab) {
      case 'requirements':
        return <RequirementsPage 
          data={formData.requirements} 
          updateData={(data) => updateFormData('requirements', data)} 
        />;
      case 'api':
        return <APIDesignPage 
          data={formData.api} 
          updateData={(data) => updateFormData('api', data)} 
        />;
      case 'data':
        return <DataModelPage 
          data={formData.data} 
          updateData={(data) => updateFormData('data', data)} 
        />;
      case 'architecture':
        return <SystemArchitecturePage 
          data={formData.architecture} 
          updateData={(data) => updateFormData('architecture', data)} 
        />;
      case 'scaling':
        return <ScalingStrategyPage 
          data={formData.scaling} 
          updateData={(data) => updateFormData('scaling', data)} 
        />;
      case 'reliability':
        return <ReliabilitySecurityPage 
          data={formData.reliability} 
          updateData={(data) => updateFormData('reliability', data)} 
        />;
      default:
        return <RequirementsPage 
          data={formData.requirements} 
          updateData={(data) => updateFormData('requirements', data)} 
        />;
    }
  };
  
  // Handler for "Ask Coach" button clicks with shift-click functionality
  const handleAskCoach = async (e) => {
    // Check if shift key was pressed
    const isShiftClick = e && e.shiftKey;
    
    // If this is a shift-click, handle differently
    if (isShiftClick) {
      console.log("Shift-click detected on Ask Coach button");
      // Example: Show an alert or perform a different action
      alert("Shift-click detected! You can implement special functionality here, like advanced coaching options.");
      return;
    }
    
    // Regular ask coach functionality
    const currentData = {
      ...formData[activeTab],
      userLevel,
      conciseMode,
      currentPage: activeTab
    };
    
    try {
      // Get all workbook content for evaluation
      if (sessionId) {
        const allWorkbookData = {
          requirements: formData.requirements,
          api: formData.api,
          data: formData.data,
          architecture: formData.architecture,
          scaling: formData.scaling,
          reliability: formData.reliability
        };
        
        // Get evaluation in background (don't await to keep UI responsive)
        getEvaluation(sessionId, allWorkbookData, userLevel, conciseMode)
          .catch(err => console.error('Background evaluation error:', err));
      }
    } catch (error) {
      console.error('Error in handleAskCoach:', error);
    }
    
    setShowCoach(true);
  };

  const handleSave = async () => {
    console.log('Save button clicked');
    if (!sessionId || !workbookData) {
      console.error('Missing required data for save');
      return;
    }
    
    try {
      setSaveStatus('saving');
      await autoSaveWorkbook(sessionId, workbookData, userId, setSaveStatus);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Layout className="h-8 w-8 text-indigo-600" />
                <span className="font-bold text-lg text-gray-900 ml-2">System Design Coach</span>
              </div>
              
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <button 
                  onClick={onBack}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                  Workbook
                </button>
                <button className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  History
                </button>
              </div>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Progress indicator */}
              <div className="flex items-center mr-4">
                <div className="w-32 mr-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`${getProgressBarStyles(activeTab)} h-2.5 rounded-full`} style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{progressPercent}%</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={(e) => handleAskCoach(e)}
                className={`flex items-center px-4 py-2 ${getCoachButtonStyles(activeTab)} text-white rounded`}
              >
                <MessageSquare size={18} className="mr-2" />
                <span className="hidden md:inline">Ask Coach</span>
              </button>
              
              <div className="ml-4 relative">
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                  <span className="sr-only">Open user menu</span>
                  <LogOut size={18} />
                </button>
              </div>
              
              <div className="-mr-2 flex items-center md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Tabs Navigation */}
      <div className="hidden md:block bg-white border-b border-gray-200">
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
                {tab.id === 'requirements' && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    Complete
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-base font-medium ${
                  getMobileTabStyles(tab.id, activeTab === tab.id)
                }`}
              >
                {tab.icon}
                <span className="ml-3">{tab.label}</span>
                {tab.id === 'requirements' && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    Complete
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Mobile Settings */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Settings</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="text-base font-medium text-gray-800">Concise Mode</span>
                <ConciseModeToggle 
                  isEnabled={conciseMode}
                  onToggle={setConciseMode}
                />
              </div>
              <div className="px-4 py-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-800">Experience Level</span>
                  <ExperienceLevelSelector 
                    currentLevel={userLevel}
                    onLevelChange={setUserLevel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{workbookName}</h1>
            <div className="flex space-x-3">
              <button className={`flex items-center ${getExportButtonStyles(activeTab)}`}>
                <Save size={16} className="mr-1" />
                <span className="text-sm font-medium">Export PDF</span>
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          {getActivePageComponent()}
        </div>
      </main>
      
      {/* Coach Interface (Sliding Panel) */}
      {showCoach && (
        <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">System Design Coach</h3>
              <button 
                onClick={() => setShowCoach(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-gray-800 mb-2">I've reviewed your {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} section and have some suggestions:</p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                  <li>Consider adding more specific metrics for your non-functional requirements</li>
                  <li>Your user types are clear, but you might want to add user personas</li>
                  <li>For scale & load, include data growth projections over time</li>
                </ul>
              </div>
              
              <div className={`${getCoachPanelBgStyle(activeTab)} rounded-lg p-4 mb-4`}>
                <p className={`${getCoachPanelTextStyle(activeTab)} mb-2 font-medium`}>Questions to consider:</p>
                <ul className="list-disc pl-5 space-y-2 text-indigo-700 text-sm">
                  <li>What are the main user flows through your system?</li>
                  <li>Are there any regulatory requirements that might affect your design?</li>
                  <li>Do you need to support international users?</li>
                </ul>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-800 mb-2">Here's an example of how you might elaborate:</p>
                <div className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-700">
                  <p><strong>Scale & Load:</strong></p>
                  <p>- Daily active users: ~50,000</p>
                  <p>- Peak traffic: 1,000 requests/second during business hours</p>
                  <p>- Data growth: 5TB/year initially, expected to grow 40% YoY</p>
                  <p>- Average session duration: 15 minutes</p>
                  <p>- Read to write ratio: 80:20</p>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className={`w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 ${getCoachInputFocusStyle(activeTab)}`}
                />
                <button className={`absolute right-2 top-2 ${getExportButtonStyles(activeTab)}`}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Save Workbook</h3>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workbook Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={workbookName}
                onChange={(e) => setWorkbookName(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={workbookTags}
                onChange={(e) => setWorkbookTags(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="mr-3 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded flex items-center ${
                  saveStatus === 'error' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white`}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <CheckCircle size={16} className="mr-2 text-green-300" />
                    Saved
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <AlertCircle size={16} className="mr-2" />
                    Retry Save
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkbookLayout;