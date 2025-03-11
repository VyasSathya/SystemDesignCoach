// client/components/ScalingStrategyPage.js
import React, { useState } from 'react';

const ScalingStrategyPage = ({ data = {}, updateData }) => {
  const [formState, setFormState] = useState({
    scaleApproach: data.scaleApproach || '',
    loadBalancing: data.loadBalancing || '',
    dbScaling: data.dbScaling || '',
    caching: data.caching || '',
    cdn: data.cdn || '',
    serviceDiscovery: data.serviceDiscovery || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newState = { ...formState, [name]: value };
    setFormState(newState);
    if (updateData) {
      updateData(newState);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Scaling Strategy</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scaling Approach
        </label>
        <textarea
          name="scaleApproach"
          value={formState.scaleApproach}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Vertical vs horizontal scaling, auto-scaling strategies..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Load Balancing
        </label>
        <textarea
          name="loadBalancing"
          value={formState.loadBalancing}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Load balancing approaches and algorithms..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Database Scaling
          </label>
          <textarea
            name="dbScaling"
            value={formState.dbScaling}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Sharding, replication, read replicas..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Caching Strategy
          </label>
          <textarea
            name="caching"
            value={formState.caching}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Multi-level caching, distributed caches..."
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CDN Architecture
          </label>
          <textarea
            name="cdn"
            value={formState.cdn}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Content delivery strategy, edge caching..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Discovery & Orchestration
          </label>
          <textarea
            name="serviceDiscovery"
            value={formState.serviceDiscovery}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Service discovery, container orchestration..."
          />
        </div>
      </div>
    </div>
  );
};

export default ScalingStrategyPage;