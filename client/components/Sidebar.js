import React from 'react';
import { useRouter } from 'next/router';
import { Book, BarChart2, Award, Layout, Clock, Activity, School } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ activeTab }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-slate-900 text-white p-4 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="h-8 w-8 rounded-md bg-indigo-500 flex items-center justify-center">
          <Layout className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold">System Design Coach</h1>
      </div>
      
      <div className="space-y-1">
        <button 
          className={`w-full text-left px-3 py-2 rounded ${activeTab === 'home' ? 'bg-indigo-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          onClick={() => router.push('/dashboard')}
        >
          <div className="flex items-center">
            <Layout className="mr-3 h-4 w-4" />
            Dashboard
          </div>
        </button>
        
        <button 
          className={`w-full text-left px-3 py-2 rounded ${activeTab === 'problems' ? 'bg-indigo-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          onClick={() => router.push('/problems')}
        >
          <div className="flex items-center">
            <Book className="mr-3 h-4 w-4" />
            Design Problems
          </div>
        </button>
        
        <button 
          className={`w-full text-left px-3 py-2 rounded ${activeTab === 'progress' ? 'bg-indigo-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          onClick={() => router.push('/progress')}
        >
          <div className="flex items-center">
            <BarChart2 className="mr-3 h-4 w-4" />
            My Progress
          </div>
        </button>
        
        <button 
          className={`w-full text-left px-3 py-2 rounded ${activeTab === 'certs' ? 'bg-indigo-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          onClick={() => router.push('/certifications')}
        >
          <div className="flex items-center">
            <Award className="mr-3 h-4 w-4" />
            Certifications
          </div>
        </button>

        <button 
          className={`w-full text-left px-3 py-2 rounded ${activeTab === 'coaching' ? 'bg-green-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          onClick={() => router.push('/coaching')}
        >
          <div className="flex items-center">
            <School className="mr-3 h-4 w-4" />
            <span>Coaching Sessions</span>
          </div>
        </button>

        <button 
          className={`w-full text-left px-3 py-2 rounded ${activeTab === 'interviews' ? 'bg-indigo-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          onClick={() => router.push('/interviews')}
        >
          <div className="flex items-center">
            <Activity className="mr-3 h-4 w-4" />
            <span>Practice Interviews</span>
          </div>
        </button>
        
        
      </div>
      
      <div className="mt-auto">
        <div className="bg-slate-800 rounded-lg p-4 text-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Pro Plan</span>
            <span className="bg-emerald-600 text-white px-2 py-1 rounded text-xs">Active</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 mb-3">
            <Clock className="h-4 w-4" />
            <span>Unlimited access</span>
          </div>
          <button 
            className="bg-slate-700 hover:bg-slate-600 text-sm text-white w-full py-2 rounded"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;