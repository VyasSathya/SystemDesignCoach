import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Design Problems', path: '/problems' },
    { label: 'Coaching Sessions', path: '/coaching' },
    { label: 'Practice Interviews', path: '/interviews' },
    { label: 'My Progress', path: '/progress' },
    { label: 'Certifications', path: '/certifications' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-xl font-bold">System Design Coach</span>
      </div>
      
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          return (
            <button 
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              className={
                router.pathname === item.path 
                  ? 'w-full flex items-center px-3 py-2 rounded transition-colors bg-indigo-700 text-white'
                  : 'w-full flex items-center px-3 py-2 rounded transition-colors text-slate-300 hover:bg-slate-800'
              }
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="bg-slate-800 rounded p-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Pro Plan</span>
          <span className="bg-emerald-600 px-2 py-0.5 rounded text-xs">Active</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300 mb-3">
          <span>Unlimited access</span>
        </div>
        <button 
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
