import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import MetricCard from '../components/MetricCard';
import { Activity, Users, BookOpen, Bookmark, BarChart2 } from 'lucide-react';

export default function Dashboard({ onSelectWorkbook }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab="dashboard" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">View your system design practice statistics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Sessions Completed" 
            value="12"
            icon={<Activity className="h-6 w-6 text-white" />}
            iconBgColor="bg-blue-500"
            progress={60}
            subtext="20 sessions total"
          />
          <MetricCard 
            title="Hours Practiced" 
            value="24.5"
            icon={<BookOpen className="h-6 w-6 text-white" />}
            iconBgColor="bg-green-500"
            progress={75}
            subtext="Target: 30 hours"
          />
          <MetricCard 
            title="Avg. Score" 
            value="8.4"
            icon={<BarChart2 className="h-6 w-6 text-white" />}
            iconBgColor="bg-purple-500"
            progress={84}
            subtext="Out of 10"
          />
          <MetricCard 
            title="Designs Saved" 
            value="7"
            icon={<Bookmark className="h-6 w-6 text-white" />}
            iconBgColor="bg-orange-500"
            subtext="3 shared with community"
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Continue Your Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={onSelectWorkbook}
              className="flex items-center p-4 border border-indigo-200 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            >
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium">System Design Workbook</h3>
                <p className="text-sm text-indigo-600">Create structured system designs</p>
              </div>
            </button>
            
            <Link href="/interviews">
              <div className="flex items-center p-4 border border-green-200 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Practice Interviews</h3>
                  <p className="text-sm text-green-600">Simulate real interviews</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="rounded-full bg-blue-100 p-2 mr-4">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Completed Practice Interview</h3>
                <p className="text-sm text-gray-600">You scored 8.5/10 on "Design Twitter"</p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="rounded-full bg-purple-100 p-2 mr-4">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Completed System Design</h3>
                <p className="text-sm text-gray-600">You created "URL Shortener" design</p>
                <p className="text-xs text-gray-500 mt-1">3 days ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-green-100 p-2 mr-4">
                <Bookmark className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Saved Design Template</h3>
                <p className="text-sm text-gray-600">You saved "E-commerce Platform" template</p>
                <p className="text-xs text-gray-500 mt-1">5 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}