// client/components/diagram/ElementTypeIndicator.js
import React from 'react';
import { 
  Database, Server, Globe, Archive, Grid, Box, Share2 
} from 'lucide-react';

/**
 * Component to display a visual indicator of the node type
 * for use in the diagram and in the editor UI
 */
const ElementTypeIndicator = ({ type, size = 'md', showLabel = false, className = '' }) => {
  // Configure the element based on type
  const elements = {
    client: {
      icon: <Globe />,
      label: 'Client',
      color: 'text-blue-500'
    },
    service: {
      icon: <Server />,
      label: 'Service',
      color: 'text-green-500'
    },
    database: {
      icon: <Database />,
      label: 'Database',
      color: 'text-purple-500'
    },
    cache: {
      icon: <Archive />,
      label: 'Cache',
      color: 'text-red-500'
    },
    loadBalancer: {
      icon: <Grid />,
      label: 'Load Balancer',
      color: 'text-orange-500'
    },
    queue: {
      icon: <Share2 />,
      label: 'Queue',
      color: 'text-indigo-500'
    },
    custom: {
      icon: <Box />,
      label: 'Custom',
      color: 'text-gray-500'
    }
  };

  // Choose the element based on type, default to custom if not found
  const element = elements[type] || elements.custom;

  // Size classes for the icon
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${element.color} ${sizeClasses[size] || sizeClasses.md}`}>
        {element.icon}
      </div>
      
      {showLabel && (
        <span className="ml-1 text-xs font-medium">{element.label}</span>
      )}
    </div>
  );
};

export default ElementTypeIndicator;