import React, { useState } from 'react';
import { mockProjects, mockMembers, Member } from '../mockData';
import { BrainCircuit, Plus, X, Search, Zap, CheckCircle2, FileText, XCircle } from 'lucide-react';

interface ProjectGeneratorProps {
  onActivate: (projectName: string) => void;
  onViewDetails: (projectId: string) => void;
  onShowToast: (msg: string) => void;
  isLoading?: boolean;
}

export function ProjectGenerator({ onActivate, onViewDetails, onShowToast, isLoading }: ProjectGeneratorProps) {
  const [projects, setProjects] = useState(mockProjects);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleRemoveMember = (projectId: string, memberId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, suggestedMembers: p.suggestedMembers.filter(id => id !== memberId) };
      }
      return p;
    }));
  };

  const handleAddMember = (projectId: string, memberId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId && !p.suggestedMembers.includes(memberId)) {
        return { ...p, suggestedMembers: [...p.suggestedMembers, memberId] };
      }
      return p;
    }));
    setSearchQueries({ ...searchQueries, [projectId]: '' });
  };

  const handleRejectSubmit = (projectId: string, withReason: boolean) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setRejectingId(null);
    setRejectReason('');
    if (withReason) {
      onShowToast(`Project rejected. AI model weights updated with your feedback.`);
    } else {
      onShowToast(`Project rejected.`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8 flex justify-between items-end border-b-2 border-slate-900 pb-4">
          <div className="h-10 w-64 bg-slate-200 animate-pulse border-2 border-slate-300"></div>
          <div className="h-10 w-40 bg-slate-200 animate-pulse border-2 border-slate-300"></div>
        </div>
        <div className="space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border-2 border-slate-300 bg-slate-50 flex flex-col xl:flex-row animate-pulse h-96">
              <div className="p-6 xl:w-2/3 border-b-2 xl:border-b-0 xl:border-r-2 border-slate-300 flex flex-col space-y-4">
                <div className="h-8 bg-slate-200 w-1/2"></div>
                <div className="h-4 bg-slate-200 w-full"></div>
                <div className="h-4 bg-slate-200 w-5/6"></div>
                <div className="h-32 bg-slate-200 w-full mt-auto"></div>
              </div>
              <div className="p-6 xl:w-1/3 space-y-4">
                <div className="h-6 bg-slate-200 w-1/2 mb-8"></div>
                <div className="h-12 bg-slate-200 w-full"></div>
                <div className="h-12 bg-slate-200 w-full"></div>
                <div className="h-12 bg-slate-200 w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end border-b-2 border-slate-900 pb-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-600" />
            Project Generator
          </h2>
          <p className="text-slate-500 font-mono text-sm mt-2">AI-synthesized initiatives based on organizational technical DNA</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 font-bold uppercase text-sm border-2 border-slate-900 hover:bg-slate-800 transition-colors">
          <BrainCircuit className="w-4 h-4" />
          Regenerate Ideas
        </button>
      </div>

      <div className="space-y-8">
        {projects.map(project => (
          <div key={project.id} className="border-2 border-slate-900 bg-white flex flex-col xl:flex-row">
            {/* Project Details */}
            <div className="p-6 xl:w-2/3 border-b-2 xl:border-b-0 xl:border-r-2 border-slate-900 flex flex-col">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold">{project.title}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 font-mono text-xs font-bold uppercase">
                    High Match
                  </span>
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">{project.description}</p>
                
                {/* AI Reasoning Box */}
                <div className="border-2 border-dashed border-blue-400 bg-blue-50 p-4 relative mt-auto">
                  <div className="absolute -top-3 left-4 bg-blue-50 px-2 flex items-center gap-2 text-blue-700 font-bold uppercase text-xs tracking-wider">
                    <BrainCircuit className="w-4 h-4" />
                    AI Strategic Reasoning
                  </div>
                  <p className="font-mono text-sm text-blue-900 leading-relaxed pt-2">
                    {project.reasoning}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Matcher */}
            <div className="p-6 xl:w-1/3 bg-slate-50 flex flex-col">
              <h4 className="font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Suggested Team
              </h4>
              
              <div className="space-y-3 mb-6 flex-1">
                {project.suggestedMembers.map(memberId => {
                  const member = mockMembers.find(m => m.id === memberId);
                  if (!member) return null;
                  return (
                    <div key={member.id} className="flex items-center justify-between bg-white border border-slate-300 p-2">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 border border-slate-900" />
                        <div>
                          <div className="font-bold text-sm">{member.name}</div>
                          <div className="font-mono text-[10px] text-slate-500">{member.handle}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveMember(project.id, member.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* Search & Add */}
                <div className="relative mt-4">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search & Add Member..."
                    value={searchQueries[project.id] || ''}
                    onChange={(e) => setSearchQueries({ ...searchQueries, [project.id]: e.target.value })}
                    className="block w-full pl-8 pr-3 py-2 border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:border-slate-900"
                  />
                  {searchQueries[project.id] && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-900 shadow-lg max-h-48 overflow-y-auto">
                      {mockMembers
                        .filter(m => !project.suggestedMembers.includes(m.id))
                        .filter(m => m.name.toLowerCase().includes(searchQueries[project.id].toLowerCase()) || m.handle.toLowerCase().includes(searchQueries[project.id].toLowerCase()))
                        .map(member => (
                          <button
                            key={member.id}
                            onClick={() => handleAddMember(project.id, member.id)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center gap-2 border-b border-slate-100 last:border-0"
                          >
                            <Plus className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-sm">{member.name}</span>
                            <span className="font-mono text-[10px] text-slate-500">{member.handle}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => onViewDetails(project.id)}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-2 border-2 border-slate-900 transition-colors uppercase tracking-wider text-xs"
                  >
                    <FileText className="w-4 h-4" />
                    Details
                  </button>
                  <button 
                    onClick={() => setRejectingId(project.id)}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 font-bold py-3 px-2 border-2 border-slate-900 transition-colors uppercase tracking-wider text-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    Disapprove
                  </button>
                </div>
                <button 
                  onClick={() => onActivate(project.title)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 border-2 border-slate-900 transition-colors uppercase tracking-wider text-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Activate & Notify
                </button>
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

// Simple icon component since we didn't import Users from lucide-react in this file
function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
