// client/components/ExperienceLevelSelector.js
import React from 'react';
import { User } from 'lucide-react';

const ExperienceLevelSelector = ({ currentLevel, onLevelChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Experience Level</h3>
      <div className="flex items-center space-x-2 mb-2">
        <User size={18} className="text-gray-500" />
        <span className="text-sm text-gray-600">Select your experience level</span>
      </div>
      <select 
        value={currentLevel} 
        onChange={(e) => onLevelChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="junior">Junior Engineer</option>
        <option value="mid-level">Mid-Level Engineer</option>
        <option value="senior">Senior Engineer</option>
        <option value="staff+">Staff+ Engineer</option>
      </select>
    </div>
  );
};

export default ExperienceLevelSelector;