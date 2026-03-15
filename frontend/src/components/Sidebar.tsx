import React from 'react';
import { Users, Library, Activity, Settings, LogOut, PlusCircle, Trophy, FolderKanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: 'members' | 'projects' | 'meritocracy' | 'create_project' | 'settings';
  setActiveTab: (tab: 'members' | 'projects' | 'meritocracy' | 'create_project' | 'settings') => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const { user } = useAuth();
  
  return (
    <div className="w-64 border-r-2 border-slate-900 bg-slate-50 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b-2 border-slate-900 bg-white">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold tracking-tight uppercase">Communa AI</h1>
        </div>
        <div className="mt-4 inline-block px-2 py-1 border border-slate-900 bg-slate-100 text-[10px] font-mono uppercase font-bold tracking-wider">
          ORG: {user?.organization_login || 'N/A'}
        </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-colors ${
            activeTab === 'members' 
              ? 'bg-slate-900 text-white border-slate-900' 
              : 'bg-transparent text-slate-600 border-transparent hover:border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Users className="w-5 h-5" />
          Member Grid
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-colors ${
            activeTab === 'projects' || activeTab === 'create_project'
              ? 'bg-slate-900 text-white border-slate-900' 
              : 'bg-transparent text-slate-600 border-transparent hover:border-slate-300 hover:bg-slate-100'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          Project Generator
        </button>

        <button
          onClick={() => setActiveTab('meritocracy')}
          className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-colors ${
            activeTab === 'meritocracy' 
              ? 'bg-slate-900 text-white border-slate-900' 
              : 'bg-transparent text-slate-600 border-transparent hover:border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-5 h-5" />
          Meritocracy
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full mt-auto flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-colors ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </nav>

      <div className="p-4 border-t-2 border-slate-900">
        {user ? (
          <div className="mb-4 flex items-center gap-3 px-2 py-2 border-2 border-slate-900 bg-white">
            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.github_id}`} alt={user.name} className="w-8 h-8 rounded-full border border-slate-900 bg-slate-100" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold uppercase truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{user.github_id}</p>
            </div>
          </div>
        ) : null}

        <button 
          onClick={() => setActiveTab('create_project')}
          className={`w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 font-bold uppercase text-xs border-2 transition-colors ${
            activeTab === 'create_project'
              ? 'bg-blue-600 text-white border-blue-800'
              : 'bg-slate-100 text-blue-600 border-blue-600 hover:bg-blue-50'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Create Project
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Disconnect
        </button>
      </div>
    </div>
  );
}
