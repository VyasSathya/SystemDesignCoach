// client/components/evaluation/EvaluationSummary.js
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Award, AlertTriangle, Check } from 'lucide-react';

const EvaluationSummary = ({ evaluation, scores }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!evaluation) return null;
  
  // Extract overall score
  const overallScore = scores?.overall?.score || 0;
  
  // Determine score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Extract priority improvements section if present
  const priorityMatch = /Priority Improvements:[^\n]*\n((?:[\d\.\s]+[^\n]+\n)+)/i.exec(evaluation);
  const priorities = priorityMatch ? priorityMatch[1].trim() : '';
  
  // Extract strengths section if present
  const strengthsMatch = /Strengths:[^\n]*\n((?:\*\s+[^\n]+\n)+)/i.exec(evaluation);
  const strengths = strengthsMatch ? strengthsMatch[1].trim() : '';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Award size={20} className="text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Evaluation Summary</h2>
        </div>
        <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
          {overallScore}/100
        </div>
      </div>
      
      {/* Extract and display the summary paragraph */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Assessment</h3>
        <p className="text-gray-700">
          {evaluation.split(/\n\n/)[0].replace(/^.*Overall Score:.*\n/, '').trim()}
        </p>
      </div>
      
      {/* Display strengths if available */}
      {strengths && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <Check size={16} className="text-green-500 mr-2" />
            Strengths
          </h3>
          <div className="pl-4 border-l-4 border-green-500">
            {strengths.split('\n').map((item, index) => (
              <p key={index} className="mb-2 text-gray-700">{item}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* Display priority improvements if available */}
      {priorities && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <AlertTriangle size={16} className="text-amber-500 mr-2" />
            Priority Improvements
          </h3>
          <div className="pl-4 border-l-4 border-amber-500">
            {priorities.split('\n').map((item, index) => (
              <p key={index} className="mb-2 text-gray-700">{item}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* Expand/collapse full evaluation */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={18} className="mr-1" />
              Hide Full Evaluation
            </>
          ) : (
            <>
              <ChevronDown size={18} className="mr-1" />
              View Full Evaluation
            </>
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {evaluation}
            </pre>
          </div>
        )}
      </div>
      
      {/* Dimension scores if expanded */}
      {isExpanded && scores && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dimension Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scores)
              .filter(([key]) => key !== 'overall')
              .map(([dimension, { score, maxScore }]) => (
                <div key={dimension} className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{dimension}</span>
                    <span className={`font-bold ${getScoreColor(score)}`}>{score}/{maxScore}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(score).replace('text-', 'bg-')}`}
                      style={{ width: `${(score / maxScore) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationSummary;