import React from 'react';
import { Save, AlertCircle, CheckCircle } from 'react-feather';

const PageLayout = ({
  title,
  children,
  onSubmit,
  saveStatus,
  progress,
  validationErrors = [],
  isSubmitDisabled = false
}) => {
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return <Save className="animate-spin text-blue-500" size={20} />;
      case 'saved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <div className="flex items-center space-x-4">
                {renderSaveStatus()}
                <button
                  onClick={onSubmit}
                  disabled={isSubmitDisabled}
                  className={`px-4 py-2 rounded-md text-white ${
                    isSubmitDisabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            {progress !== undefined && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Overall Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Validation errors */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <h3 className="text-sm font-medium text-red-800">Please fix the following issues:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;