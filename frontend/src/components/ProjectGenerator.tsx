import React, { useState, useEffect } from 'react';
import { mockProjects, mockMembers, Member } from '../mockData';
import { Target, Users, Zap, CheckCircle2, ChevronRight, BookOpen, Clock, Activity, Plus, XCircle, RefreshCcw } from 'lucide-react';
import { projectsApi } from '../api/projects';

interface ProjectGeneratorProps {
  onActivate: (projectName: string) => void;
  onViewDetails: (projectId: string) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
  onShowToast: (msg: string) => void;
}

export function ProjectGenerator({ onActivate, onViewDetails, onCreateNew, isLoading, onShowToast }: ProjectGeneratorProps) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activating, setActivating] = useState<string | null>(null);
  const [refreshingIdeas, setRefreshingIdeas] = useState(false);

  useEffect(() => {
    const loadProposals = async () => {
      try {
        const data = await projectsApi.listProposals();
        setProposals(data);
      } catch (err) {
        console.error('Failed to load proposals', err);
      } finally {
        setLoadingProposals(false);
      }
    };
    loadProposals();
  }, []);

  const handleRemoveMember = (projectId: string, memberId: string) => {
    setProposals(proposals.map(p => {
      if (p.id === projectId) {
        return { ...p, suggestedMembers: p.suggestedMembers.filter(id => id !== memberId) };
      }
      return p;
    }));
  };

  const handleAddMember = (projectId: string, memberId: string) => {
    setProposals(proposals.map(p => {
      if (p.id === projectId && !p.suggestedMembers.includes(memberId)) {
        return { ...p, suggestedMembers: [...p.suggestedMembers, memberId] };
      }
      return p;
    }));
    setSearchQueries({ ...searchQueries, [projectId]: '' });
  };

  const handleRejectSubmit = (projectId: string, withReason: boolean) => {
    setProposals(proposals.filter(p => p.id !== projectId));
    setRejectingId(null);
    setRejectReason('');
    if (withReason) {
      onShowToast(`Project rejected. AI model weights updated with your feedback.`);
    } else {
      onShowToast(`Project rejected.`);
    }
  };

  const handleActivate = async (id: number, title: string) => {
    setActivating(title);
    try {
      await projectsApi.activateProposal(id);
      onShowToast(`Activated ${title}! Team assignments created.`);
      onActivate(title);
    } catch (err) {
      console.error(err);
      onShowToast(`Failed to activate ${title}`);
    } finally {
      setActivating(null);
    }
  };

  const handleRefreshIdeas = async () => {
    setRefreshingIdeas(true);
    try {
      const data = await projectsApi.refreshProposals();
      setProposals(data);
      onShowToast('AI generated fresh project ideas.');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to refresh AI ideas.');
    } finally {
      setRefreshingIdeas(false);
    }
  };

  if (loadingProposals || isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <Zap className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-8 border-b-2 border-slate-900 pb-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            AI Initiated Projects
          </h2>
          <p className="text-slate-500 font-mono text-sm mt-2">Platform-generated high-impact proposals based on community skill gaps.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshIdeas}
            disabled={refreshingIdeas}
            className="flex items-center gap-2 border-2 border-blue-700 bg-blue-600 text-white font-bold uppercase text-sm tracking-wider px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshingIdeas ? 'animate-spin' : ''}`} />
            {refreshingIdeas ? 'Refreshing...' : 'Refresh Ideas'}
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 border-2 border-slate-900 bg-slate-900 text-white font-bold uppercase text-sm tracking-wider px-4 py-2 hover:bg-slate-800 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Create My Own
          </button>
        </div>
      </div>

      <div className="grid gap-6 px-1">
        {proposals.map((project) => (
          <div key={project.id} className="bg-white border-2 border-slate-900 p-6 flex flex-col md:flex-row gap-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] group hover:-translate-y-1 hover:translate-x-1 transition-transform relative overflow-hidden">

            {/* Status Badge */}
            <div className="absolute top-0 right-0 bg-amber-400 border-l-2 border-b-2 border-slate-900 px-3 py-1 font-mono font-bold text-xs uppercase flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {project.status.replace('_', ' ')}
            </div>

            <div className="flex-1 mt-4">
              <h3 className="text-2xl font-bold uppercase mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{project.title}</h3>
              <p className="text-slate-600 mb-6 font-mono text-sm leading-relaxed max-w-2xl">
                {project.description}
              </p>
              <div className="border-l-4 border-emerald-500 pl-4 py-1 mb-6 bg-slate-50 pr-4">
                <p className="text-sm font-mono text-slate-700 italic">
                  "{project.ai_reasoning}"
                </p>
              </div>
            </div>

            {/* Team Matcher */}
            <div className="w-full md:w-72 bg-slate-50 border-2 border-slate-900 p-4 flex flex-col shrink-0">
              <h4 className="font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2 text-slate-500 border-b-2 border-slate-200 pb-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Suggested Team ({project.team_assignments?.length || 0})
              </h4>
              <div className="space-y-3 flex-1">
                {project.team_assignments?.slice(0, 3).map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center gap-3 bg-white p-2 border-2 border-slate-100">
                    <img
                      src={assignment.member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignment.member.github_id}`}
                      alt={assignment.member.name}
                      className="w-10 h-10 border-2 border-slate-900 bg-slate-100"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate uppercase">{assignment.member.name}</p>
                      <p className="text-xs text-emerald-600 font-mono font-bold truncate">{assignment.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-3">
                <div className="mt-4 pt-4 border-t-2 border-slate-200 space-y-2">
                  <button
                    onClick={() => onViewDetails(String(project.id))}
                    className="w-full py-2 bg-white border-2 border-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Intel
                  </button>
                  <button
                    onClick={() => handleActivate(project.id, project.title)}
                    disabled={activating === project.title}
                    className="w-full py-2 bg-slate-900 text-white border-2 border-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                  >
                    {activating === project.title ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Activate
                        <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-slate-900 p-6 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-2xl font-bold uppercase mb-2 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              Disapprove Project
            </h3>
            <p className="text-slate-600 mb-6 text-sm">Provide reasoning to help the AI model learn and generate better initiatives next time.</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., We don't have enough bandwidth for another frontend project right now..."
              className="w-full h-32 p-3 border-2 border-slate-900 mb-6 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 font-bold uppercase text-sm border-2 border-slate-900 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleRejectSubmit(rejectingId, false)}
                className="px-4 py-2 font-bold uppercase text-sm border-2 border-slate-900 text-red-600 hover:bg-red-50"
              >
                Skip & Reject
              </button>
              <button 
                onClick={() => handleRejectSubmit(rejectingId, true)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 font-bold uppercase text-sm border-2 border-slate-900 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


