import React from 'react';

const ProgressBar = ({ 
  progress, 
  color = 'blue',
  showCount = true,
  completed = 0,
  total = 0,
  label = 'sections'
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white p-4 border rounded-md mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-600">Overall Progress</span>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div 
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-300`} 
          style={{ width: `${progress}%` }}
        />
      </div>
      {showCount && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="font-medium">{completed}</span> of{' '}
          <span className="font-medium">{total}</span> {label} completed
        </div>
      )}
    </div>
  );
};

export default ProgressBar;