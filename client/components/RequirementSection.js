import React from 'react';
import { Trash2, Plus, Check } from 'react-feather';

const RequirementSection = ({
  title,
  items,
  progress,
  onUpdate,
  onAdd,
  onDelete,
  onToggle
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          <div className="w-24 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div
            key={item.id}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
          >
            <button
              onClick={() => onToggle(item.id)}
              className={`p-1 rounded-full ${
                item.status === 'complete'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Check size={16} />
            </button>

            <div className="flex-grow">
              <textarea
                value={item.description}
                onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                placeholder="Enter requirement description..."
                className="w-full min-h-[60px] p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => onDelete(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus size={16} className="mr-1" />
          Add {title.replace(/s$/, '')}
        </button>
      </div>
    </div>
  );
};

export default RequirementSection;