// client/components/ReliabilitySecurityPage.js
import React, { useState } from 'react';

const ReliabilitySecurityPage = ({ data = {}, updateData }) => {
  const [formState, setFormState] = useState({
    faultTolerance: data.faultTolerance || '',
    dataBackup: data.dataBackup || '',
    monitoring: data.monitoring || '',
    securityMeasures: data.securityMeasures || '',
    compliance: data.compliance || '',
    disasterRecovery: data.disasterRecovery || ''
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
      <h2 className="text-xl font-bold text-gray-900">Reliability & Security</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fault Tolerance
        </label>
        <textarea
          name="faultTolerance"
          value={formState.faultTolerance}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Redundancy, failover mechanisms, circuit breakers..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Backup & Recovery
          </label>
          <textarea
            name="dataBackup"
            value={formState.dataBackup}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Backup strategies, recovery point objectives..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monitoring & Alerting
          </label>
          <textarea
            name="monitoring"
            value={formState.monitoring}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Monitoring tools, metrics collection, alerting..."
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Security Measures
        </label>
        <textarea
          name="securityMeasures"
          value={formState.securityMeasures}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Authentication, authorization, encryption, secure coding practices..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compliance & Regulations
          </label>
          <textarea
            name="compliance"
            value={formState.compliance}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="GDPR, HIPAA, SOC2, etc. compliance measures..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Disaster Recovery
          </label>
          <textarea
            name="disasterRecovery"
            value={formState.disasterRecovery}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Disaster recovery plans, multi-region strategy..."
          />
        </div>
      </div>
    </div>
  );
};

export default ReliabilitySecurityPage;