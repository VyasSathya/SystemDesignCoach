// components/ConciseModeToggle.js
import React from 'react';

const ConciseModeToggle = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center">
      <span className="text-sm text-gray-600 mr-2">Concise</span>
      <div 
        className={`relative inline-block w-10 h-5 transition-colors duration-200 ease-in-out rounded-full ${isEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
        onClick={() => onToggle(!isEnabled)}
      >
        <label
          className={`absolute left-0 top-0 w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-200 ease-in-out transform ${
            isEnabled ? 'translate-x-5' : 'translate-x-0'
          } cursor-pointer`}
        >
          <input
            type="checkbox"
            className="opacity-0 w-0 h-0"
            checked={isEnabled}
            onChange={() => onToggle(!isEnabled)}
          />
        </label>
      </div>
    </div>
  );
};

export default ConciseModeToggle;