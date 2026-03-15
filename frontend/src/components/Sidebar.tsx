import React from 'react';
import { Users, FolderKanban, Settings, LogOut, Activity, Trophy } from 'lucide-react';

interface SidebarProps {
  activeTab: 'members' | 'projects' | 'meritocracy';
  setActiveTab: (tab: 'members' | 'projects' | 'meritocracy') => void;
  onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  return (
    <div className="w-64 border-r-2 border-slate-900 bg-slate-50 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b-2 border-slate-900 bg-white">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold tracking-tight uppercase">Communa AI</h1>
        </div>
        <div className="mt-4 inline-block px-2 py-1 border border-slate-900 bg-slate-100 text-[10px] font-mono uppercase font-bold tracking-wider">
          ORG: BANM-OpenSource
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
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
            activeTab === 'projects' 
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

        <button className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </nav>

      <div className="p-4 border-t-2 border-slate-900">
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
