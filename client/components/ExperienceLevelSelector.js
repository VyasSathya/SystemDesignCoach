// components/ExperienceLevelSelector.js
import React from 'react';
import { User } from 'lucide-react';

const ExperienceLevelSelector = ({ currentLevel, onLevelChange }) => {
  return (
    <div className="flex items-center">
      <User size={16} className="text-gray-500 mr-2" />
      <select 
        value={currentLevel} 
        onChange={(e) => onLevelChange(e.target.value)}
        className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 p-0"
      >
        <option value="junior">Junior</option>
        <option value="mid-level">Mid-Level</option>
        <option value="senior">Senior</option>
        <option value="staff+">Staff+</option>
      </select>
    </div>
  );
};

export default ExperienceLevelSelector;