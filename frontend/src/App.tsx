import React, { useState, useCallback } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { MemberGrid } from './components/MemberGrid';
import { ProjectGenerator } from './components/ProjectGenerator';
import { ProjectDetail } from './components/ProjectDetail';
import { MeritocracyTable } from './components/MeritocracyTable';
import { Toast } from './components/Toast';

type AppState = 'login' | 'dashboard';
type TabState = 'members' | 'projects' | 'meritocracy';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [activeTab, setActiveTab] = useState<TabState>('members');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const triggerLoading = (ms: number) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), ms);
  };

  const handleLogin = () => {
    setAppState('dashboard');
    triggerLoading(1500);
  };

  const handleLogout = () => {
    setAppState('login');
    setActiveTab('members');
    setSelectedProjectId(null);
  };

  const handleTabChange = (tab: TabState) => {
    setActiveTab(tab);
    setSelectedProjectId(null);
    triggerLoading(600);
  };

  const handleActivateProject = (projectName: string) => {
    setToastMessage(`Project '${projectName}' initialized. Automated invites sent to selected members via Discord and Email.`);
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    triggerLoading(600);
  };

  if (appState === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 h-screen overflow-y-auto">
        {activeTab === 'members' ? (
          <MemberGrid isLoading={isLoading} />
        ) : activeTab === 'meritocracy' ? (
          <MeritocracyTable isLoading={isLoading} />
        ) : selectedProjectId ? (
          <ProjectDetail 
            projectId={selectedProjectId} 
            onBack={() => setSelectedProjectId(null)} 
            onActivate={handleActivateProject}
            isLoading={isLoading}
          />
        ) : (
          <ProjectGenerator 
            onActivate={handleActivateProject} 
            onViewDetails={handleViewProject}
            onShowToast={setToastMessage}
            isLoading={isLoading}
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

