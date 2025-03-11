import MetricCard from '../components/MetricCard';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="dashboard" />
      <div className="flex-1 overflow-auto p-6">
        {/* Your dashboard content */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">View your system design practice statistics</p>
        </div>
        
        {/* You can add your metrics cards or other dashboard elements here */}
      </div>
    </div>
  );
}