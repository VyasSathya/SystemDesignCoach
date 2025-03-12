// pages/WorkbookLayout.js
import React, { useState } from 'react';
import { ClipboardList, Database, Code, Layout, BarChart, Shield, MessageSquare, LogOut, Menu, X, User } from 'lucide-react';
import ExperienceLevelSelector from '../components/ExperienceLevelSelector';
import ConciseModeToggle from '../components/ConciseModeToggle';
import { getEvaluation } from '../utils/api';

// Placeholder components - replace these with your actual components when ready
const RequirementsPage = () => <div>Requirements Page</div>;
const APIDesignPage = () => <div>API Design Page</div>;
const DataModelPage = () => <div>Data Model Page</div>;
const SystemArchitecturePage = () => <div>System Architecture Page</div>;
const ScalingStrategyPage = () => <div>Scaling Strategy Page</div>;
const ReliabilitySecurityPage = () => <div>Reliability & Security Page</div>;
const CoachAgentInterface = ({ isOpen, onClose, currentPage, currentData }) => (
  isOpen ? <div>Coach Interface for {currentPage}</div> : null
);

const WorkbookLayout = ({ onBack, sessionId }) => {
  const [activeTab, setActiveTab] = useState('requirements');
  const [showCoach, setShowCoach] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userLevel, setUserLevel] = useState('mid-level');
  const [conciseMode, setConciseMode] = useState(true);
  
  const [formData, setFormData] = useState({
    requirements: {},
    api: {},
    data: {},
    architecture: {},
    scaling: {},
    reliability: {}
  });
  
  // Mock function for updating form data
  const updateFormData = (section, data) => {
    setFormData({
      ...formData,
      [section]: data
    });
  };
  
  // Define tabs for navigation
  const tabs = [
    { id: 'requirements', label: 'Requirements', icon: <ClipboardList size={18} /> },
    { id: 'api', label: 'API Design', icon: <Code size={18} /> },
    { id: 'data', label: 'Data Model', icon: <Database size={18} /> },
    { id: 'architecture', label: 'Architecture', icon: <Layout size={18} /> },
    { id: 'scaling', label: 'Scaling Strategy', icon: <BarChart size={18} /> },
    { id: 'reliability', label: 'Reliability & Security', icon: <Shield size={18} /> }
  ];
  
  const getActivePageComponent = () => {
    switch (activeTab) {
      case 'requirements':
        return <RequirementsPage data={formData.requirements} updateData={(data) => updateFormData('requirements', data)} />;
      case 'api':
        return <APIDesignPage data={formData.api} updateData={(data) => updateFormData('api', data)} />;
      case 'data':
        return <DataModelPage data={formData.data} updateData={(data) => updateFormData('data', data)} />;
      case 'architecture':
        return <SystemArchitecturePage data={formData.architecture} updateData={(data) => updateFormData('architecture', data)} />;
      case 'scaling':
        return <ScalingStrategyPage data={formData.scaling} updateData={(data) => updateFormData('scaling', data)} />;
      case 'reliability':
        return <ReliabilitySecurityPage data={formData.reliability} updateData={(data) => updateFormData('reliability', data)} />;
      default:
        return <RequirementsPage data={formData.requirements} updateData={(data) => updateFormData('requirements', data)} />;
    }
  };
  
  // Handler for "Ask Coach" button clicks from any page
  const handleAskCoach = async () => {
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
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Layout className="h-8 w-8 text-indigo-600" />
                <span className="font-bold text-lg text-gray-900 ml-2">System Design Coach</span>
              </div>
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
              
              {/* Add settings panel with concise mode toggle and experience level */}
              <div className="ml-4 flex items-center space-x-4">
                <ConciseModeToggle 
                  isEnabled={conciseMode}
                  onToggle={setConciseMode}
                />
                
                <div className="border-l border-gray-300 h-6"></div>
                
                <div className="flex items-center">
                  <User size={16} className="text-gray-500 mr-2" />
                  <select 
                    value={userLevel} 
                    onChange={(e) => setUserLevel(e.target.value)}
                    className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 p-0"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid-level">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="staff+">Staff+</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={handleAskCoach}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                <MessageSquare size={18} className="mr-2" />
                <span className="hidden md:inline">Ask Coach</span>
              </button>
              
              <div className="ml-4 relative">
                <div className="ml-3 relative">
                  <div>
                    <button className="flex items-center text-gray-500 hover:text-gray-700">
                      <span className="sr-only">Open user menu</span>
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
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
                className={`flex items-center py-4 px-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
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
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="ml-3">{tab.label}</span>
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
                  <select 
                    value={userLevel} 
                    onChange={(e) => setUserLevel(e.target.value)}
                    className="mt-1 block w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid-level">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="staff+">Staff+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {getActivePageComponent()}
        </div>
      </main>
      
      {/* Coach agent dialog */}
      {showCoach && (
        <CoachAgentInterface
          isOpen={showCoach}
          onClose={() => setShowCoach(false)}
          currentPage={activeTab}
          currentData={{
            ...formData[activeTab],
            userLevel,
            conciseMode
          }}
        />
      )}
    </div>
  );
};

export default WorkbookLayout;