import React from 'react';
import { Shield, Scale, Activity, Lightbulb } from 'lucide-react';

const AnalysisSection = ({ title, items, icon: Icon }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-blue-600" />
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li 
          key={index}
          className={`p-3 rounded-lg ${
            item.level === 'high' || item.priority === 'high' || item.severity === 'high'
              ? 'bg-red-50 text-red-700'
              : item.level === 'medium' || item.priority === 'medium' || item.severity === 'medium'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-blue-50 text-blue-700'
          }`}
        >
          <p className="text-sm">{item.message}</p>
          {item.affected && item.affected.length > 0 && (
            <p className="text-xs mt-1 opacity-75">
              Affected elements: {item.affected.join(', ')}
            </p>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const DiagramAnalysis = ({ analysis, onClose }) => {
  if (!analysis) return null;

  return (
    <div className="fixed right-4 top-20 w-96 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Diagram Analysis</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <AnalysisSection
          title="Security Concerns"
          items={analysis.security}
          icon={Shield}
        />
        <AnalysisSection
          title="Scalability"
          items={analysis.scalability}
          icon={Scale}
        />
        <AnalysisSection
          title="Reliability"
          items={analysis.reliability}
          icon={Activity}
        />
        
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">AI Suggestions</h3>
          </div>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiagramAnalysis;