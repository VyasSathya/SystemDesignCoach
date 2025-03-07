import React from 'react';

const MetricCard = ({ title, value, icon, iconBgColor, progress, subtext }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className={`h-10 w-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm text-slate-500 font-medium">{title}</h3>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="w-full h-2 bg-slate-100 rounded-full mt-4">
          <div 
            className="h-2 bg-indigo-500 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {subtext && (
        <div className="text-sm text-slate-500 mt-4">
          {subtext}
        </div>
      )}
    </div>
  );
};

export default MetricCard;