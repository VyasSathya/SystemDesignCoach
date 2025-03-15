import React from 'react';
import { Shield, TrendingUp, CheckCircle, Lightbulb } from 'lucide-react';

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

const DiagramAnalysis = ({ analysis, onClose, onApplySuggestion }) => {
  const { suggestions, security, scalability, reliability } = analysis;

  const renderSuggestionCard = (suggestion) => (
    <div className={`suggestion-card priority-${suggestion.priority}`}>
      <div className="suggestion-header">
        <span className="suggestion-type">{suggestion.type}</span>
        <span className="suggestion-priority">{suggestion.priority}</span>
      </div>
      
      <p className="suggestion-text">{suggestion.suggestion}</p>
      
      {suggestion.details && (
        <div className="suggestion-details">
          <p>{suggestion.details}</p>
        </div>
      )}

      {suggestion.benefits && (
        <div className="suggestion-benefits">
          <h4>Benefits:</h4>
          <ul>
            {suggestion.benefits.map((benefit, idx) => (
              <li key={idx}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        onClick={() => onApplySuggestion(suggestion)}
        className="apply-suggestion-btn"
      >
        Apply Suggestion
      </Button>
    </div>
  );

  return (
    <div className="diagram-analysis">
      <div className="analysis-header">
        <h2>Diagram Analysis</h2>
        <Button onClick={onClose} variant="ghost">
          <X size={16} />
        </Button>
      </div>

      <div className="analysis-sections">
        <AnalysisSection
          title="Security Concerns"
          items={security}
          icon={Shield}
        />
        <AnalysisSection
          title="Scalability Analysis"
          items={scalability}
          icon={TrendingUp}
        />
        <AnalysisSection
          title="Reliability Assessment"
          items={reliability}
          icon={CheckCircle}
        />
      </div>

      <div className="suggestions-section">
        <h3>Suggested Improvements</h3>
        <div className="suggestions-grid">
          {suggestions.map((suggestion, idx) => (
            <div key={idx} className="suggestion-wrapper">
              {renderSuggestionCard(suggestion)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiagramAnalysis;