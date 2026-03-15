import React, { useState } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { MemberGrid } from './components/MemberGrid';
import { ProjectGenerator } from './components/ProjectGenerator';
import { ProjectDetail } from './components/ProjectDetail';
import { MeritocracyTable } from './components/MeritocracyTable';
import { Toast } from './components/Toast';
import { useAuth } from './context/AuthContext';
import { GitHubCallback } from './components/GitHubCallback';
import { CreateProject } from './components/CreateProject';
import { BrainCircuit } from 'lucide-react';
import { SettingsPanel } from './components/SettingsPanel';

type TabState = 'members' | 'projects' | 'meritocracy' | 'create_project' | 'settings';

export default function App() {
  const { user, token, isLoading: isAuthLoading, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabState>('members');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simple route check for callback
  if (window.location.pathname === '/auth/callback') {
    return <GitHubCallback onComplete={() => window.location.href = '/'} />;
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <BrainCircuit className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Login />;
  }

  const handleTabChange = (tab: TabState) => {
    setActiveTab(tab);
    setSelectedProjectId(null);
  };

  const handleActivateProject = (projectName: string) => {
    setToastMessage(`Project '${projectName}' activated and notifications sent via Discord/Email.`);
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onLogout={logout} 
      />
      
      <main className="flex-1 h-screen overflow-y-auto">
        {user?.is_analyzing && (
          <div className="mx-8 mt-6 mb-2 border-2 border-amber-500 bg-amber-50 px-4 py-3">
            <p className="font-mono text-xs uppercase font-bold text-amber-700">
              Analyzing GitHub data... {Number(user.analysis_progress || 0)}%
            </p>
            <p className="text-sm text-amber-900 mt-1">{user.analysis_message || 'Preparing insights and syncing organization.'}</p>
          </div>
        )}

        {activeTab === 'members' ? (
          <MemberGrid />
        ) : activeTab === 'meritocracy' ? (
          <MeritocracyTable />
        ) : activeTab === 'settings' ? (
          <SettingsPanel onShowToast={setToastMessage} />
        ) : activeTab === 'create_project' ? (
          <CreateProject onCreated={() => handleTabChange('projects')} onShowToast={setToastMessage} />
        ) : selectedProjectId ? (
          <ProjectDetail 
            projectId={selectedProjectId} 
            onBack={() => setSelectedProjectId(null)} 
            onActivate={handleActivateProject}
          />
        ) : (
          <ProjectGenerator 
            onActivate={handleActivateProject} 
            onViewDetails={handleViewProject}
            onCreateNew={() => handleTabChange('create_project')}
            onShowToast={setToastMessage}
          />
        )}
      </main>

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
}

