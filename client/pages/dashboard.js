import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import MetricCard from '../components/MetricCard';
import { 
  Activity, 
  Users, 
  BookOpen, 
  Bookmark, 
  BarChart2 
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="dashboard" />
      <div className="flex-1 ml-64 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">View your system design practice statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/workbook" className="block">
            <div className="p-4 border rounded-lg bg-white hover:bg-gray-50">
              <h3 className="font-medium">System Design Workbook</h3>
              <p className="text-sm text-gray-600">Create structured system designs</p>
            </div>
          </Link>
          
          <Link href="/interviews" className="block">
            <div className="p-4 border rounded-lg bg-white hover:bg-gray-50">
              <h3 className="font-medium">Practice Interviews</h3>
              <p className="text-sm text-gray-600">Simulate real interviews</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
