// UnifiedWorkbookPage.js
// Core component that serves as a template for all workbook pages
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  HelpCircle
} from 'lucide-react';

const UnifiedWorkbookPage = ({ 
  pageTitle, 
  pageIcon, 
  accentColor, 
  sections, 
  data, 
  updateData, 
  coachTip, 
  validationErrors = []
}) => {
  const [expandedSections, setExpandedSections] = useState(
    Object.fromEntries(sections.map(section => [section.id, true]))
  );
  
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [progress, setProgress] = useState({
    overall: 70,
    sections: Object.fromEntries(sections.map(section => [section.id, 65 + Math.floor(Math.random() * 20)]))
  });

  const [sections, setSections] = useState([]);
  const [comments, setComments] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    version: '',
    lastModified: new Date().toISOString()
  });

  // Demo calculation of overall progress
  const calculateProgress = () => {
    const sectionsProgress = Object.values(progress.sections);
    const overall = sectionsProgress.reduce((sum, val) => sum + val, 0) / sectionsProgress.length;
    return Math.round(overall);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections({
      ...expandedSections,
      [sectionId]: !expandedSections[sectionId]
    });
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const simulateSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  // Generate bg and text colors based on accent color
  const getBgColor = () => {
    switch(accentColor) {
      case 'green': return 'bg-green-50 border-green-100';
      case 'blue': return 'bg-blue-50 border-blue-100';
      case 'red': return 'bg-red-50 border-red-100';
      case 'purple': return 'bg-purple-50 border-purple-100';
      case 'indigo': return 'bg-indigo-50 border-indigo-100';
      case 'orange': return 'bg-orange-50 border-orange-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  const getTextColor = () => {
    switch(accentColor) {
      case 'green': return 'text-green-700';
      case 'blue': return 'text-blue-700';
      case 'red': return 'text-red-700';
      case 'purple': return 'text-purple-700';
      case 'indigo': return 'text-indigo-700';
      case 'orange': return 'text-orange-700';
      default: return 'text-gray-700';
    }
  };

  const getButtonBgColor = () => {
    switch(accentColor) {
      case 'green': return 'bg-green-600 hover:bg-green-700';
      case 'blue': return 'bg-blue-600 hover:bg-blue-700';
      case 'red': return 'bg-red-600 hover:bg-red-700';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700';
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700';
      case 'orange': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Demo preview content generator
  const generatePreview = (section) => {
    switch(section.type) {
      case 'api':
        return (
          <div className="bg-gray-800 text-white p-4 rounded font-mono text-sm overflow-auto">
            <div className="text-green-400">GET /api/users</div>
            <div className="ml-4 text-gray-400">// Returns list of users</div>
            <div className="ml-4 text-blue-300">Parameters:</div>
            <div className="ml-8">limit: number (optional)</div>
            <div className="ml-4 text-blue-300">Response:</div>
            <div className="ml-8">[{`{ "id": "string", "name": "string" }`}]</div>
          </div>
        );
      case 'data-model':
        return (
          <div className="bg-white p-4 border rounded overflow-auto">
            <div className="flex flex-col space-y-4">
              <div className="border-2 border-purple-500 rounded p-3">
                <h4 className="font-bold">User</h4>
                <ul className="list-disc list-inside text-sm">
                  <li>id: UUID (PK)</li>
                  <li>email: String</li>
                  <li>name: String</li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="border-l-2 border-purple-500 h-6"></div>
              </div>
              <div className="border-2 border-purple-500 rounded p-3">
                <h4 className="font-bold">Order</h4>
                <ul className="list-disc list-inside text-sm">
                  <li>id: UUID (PK)</li>
                  <li>userId: UUID (FK)</li>
                  <li>amount: Decimal</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'architecture':
        return (
          <div className="bg-white p-4 border rounded overflow-auto">
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="font-bold">Web Tier</h4>
                <p className="text-sm">Frontend service with React</p>
              </div>
              <div className="flex justify-center">
                <div className="border-l-2 border-blue-500 h-6"></div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <h4 className="font-bold">API Layer</h4>
                <p className="text-sm">Node.js Express API service</p>
              </div>
              <div className="flex justify-center">
                <div className="border-l-2 border-blue-500 h-6"></div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h4 className="font-bold">Data Layer</h4>
                <p className="text-sm">PostgreSQL + Redis cache</p>
              </div>
            </div>
          </div>
        );
      case 'reliability':
        return (
          <div className="bg-white p-4 border rounded overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                <tr>
                  <td className="px-3 py-2">Availability</td>
                  <td className="px-3 py-2 font-mono">99.9%</td>
                  <td className="px-3 py-2 text-gray-500">8.76 hours downtime per year</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Response Time</td>
                  <td className="px-3 py-2 font-mono">200 ms</td>
                  <td className="px-3 py-2 text-gray-500">P95 latency</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Error Rate</td>
                  <td className="px-3 py-2 font-mono">0.1%</td>
                  <td className="px-3 py-2 text-gray-500">Maximum allowed failures</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 'requirements':
        return (
          <div className="bg-white p-4 border rounded overflow-auto">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="mt-1 flex-shrink-0">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">User Authentication</h4>
                  <p className="text-xs text-gray-500">Users must be able to sign up, log in, and manage their account settings.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 flex-shrink-0">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Data Export</h4>
                  <p className="text-xs text-gray-500">System must provide CSV and PDF export functionality for reports.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 flex-shrink-0">
                  <AlertCircle size={16} className="text-gray-300" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Order Processing</h4>
                  <p className="text-xs text-gray-500">System should process orders and update inventory in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'scaling':
        return (
          <div className="bg-white p-4 border rounded overflow-auto">
            <div className="space-y-3">
              <div className="border-l-4 border-orange-500 pl-3">
                <h4 className="text-sm font-medium">Horizontal Scaling</h4>
                <p className="text-xs text-gray-600">API services will scale horizontally using load balancers</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <h4 className="text-sm font-medium">Database Scaling</h4>
                <p className="text-xs text-gray-600">Read replicas for handling high read volumes</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <h4 className="text-sm font-medium">Caching Strategy</h4>
                <p className="text-xs text-gray-600">Redis cache for frequently accessed data</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white p-4 border rounded">
            <p className="italic text-gray-500">Preview not available for this section</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {pageIcon}
            <h1 className="text-xl font-bold ml-2">{pageTitle}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={togglePreview}
              className={`flex items-center px-3 py-1.5 text-sm rounded-md border ${
                previewMode ? 'bg-gray-100 text-gray-700' : 'bg-white text-gray-600'
              }`}
            >
              {previewMode ? <EyeOff size={16} className="mr-1.5" /> : <Eye size={16} className="mr-1.5" />}
              {previewMode ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button 
              onClick={simulateSave}
              className="flex items-center px-3 py-1.5 text-sm bg-white border text-gray-600 rounded-md hover:bg-gray-50"
            >
              {saveStatus === 'saving' ? (
                <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full mr-1.5"></div>
              ) : saveStatus === 'saved' ? (
                <CheckCircle size={16} className="text-green-500 mr-1.5" />
              ) : (
                <Save size={16} className="mr-1.5" />
              )}
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
            </button>
            <button className="flex items-center px-3 py-1.5 text-sm text-white rounded-md bg-blue-600 hover:bg-blue-700">
              <ExternalLink size={16} className="mr-1.5" />
              Export
            </button>
            <button className="flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
              <MessageSquare size={16} className="mr-1.5" />
              Ask Coach
            </button>
          </div>
        </div>
        
        {/* Coach tip box */}
        {coachTip && (
          <div className={`${getBgColor()} border rounded-md p-4 text-sm ${getTextColor()}`}>
            <strong className="font-medium">Coach tip:</strong> {coachTip}
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
            <span className="text-sm font-medium text-gray-700">{calculateProgress()}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${accentColor === 'green' ? 'bg-green-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'red' ? 'bg-red-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'indigo' ? 'bg-indigo-500' : accentColor === 'orange' ? 'bg-orange-500' : 'bg-gray-500'}`}
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          
          {/* Section count summary instead of small progress bars */}
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <span className="font-medium">{sections.filter(s => progress.sections[s.id] === 100).length}</span>
            <span className="mx-1">of</span>
            <span className="font-medium">{sections.length}</span>
            <span className="ml-1">sections completed</span>
          </div>
        </div>
        
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
            </div>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Sections */}
          <div className="space-y-6">
            {sections.map(section => (
              <div key={section.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center">
                    {section.icon}
                    <h3 className="text-md font-medium text-gray-700 ml-2">{section.title}</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Progress indicator in section header */}
                    <div className="flex items-center">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${accentColor === 'green' ? 'bg-green-400' : accentColor === 'blue' ? 'bg-blue-400' : accentColor === 'red' ? 'bg-red-400' : accentColor === 'purple' ? 'bg-purple-400' : accentColor === 'indigo' ? 'bg-indigo-400' : accentColor === 'orange' ? 'bg-orange-400' : 'bg-gray-400'}`}
                          style={{ width: `${progress.sections[section.id] || 0}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">{progress.sections[section.id] || 0}%</span>
                    </div>
                    
                    {section.addButton && (
                      <button className={`text-sm ${getTextColor()} px-2 py-1 rounded hover:bg-white`}>
                        <Plus size={16} />
                      </button>
                    )}
                    {expandedSections[section.id] ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedSections[section.id] && (
                  <div className="mt-3 space-y-3">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Preview Panel - Only shown when preview mode is active */}
          {previewMode && (
            <div className="space-y-6">
              <div className="sticky top-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium text-gray-700">Live Preview</h3>
                    <button className="text-gray-500 hover:text-gray-700">
                      <HelpCircle size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {sections.map(section => (
                      <div key={`preview-${section.id}`} className="bg-white border rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                          <span className="text-sm font-medium">{section.title}</span>
                          <div className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Preview</div>
                        </div>
                        <div className="p-3">
                          {generatePreview(section)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedWorkbookPage;








