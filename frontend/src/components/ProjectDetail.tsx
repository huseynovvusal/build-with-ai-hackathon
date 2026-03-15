import React from 'react';
import { mockProjects, mockMembers } from '../mockData';
import { ArrowLeft, BrainCircuit, Target, Code, Lightbulb, Users, CheckCircle2 } from 'lucide-react';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onActivate: (projectName: string) => void;
  isLoading?: boolean;
}

export function ProjectDetail({ projectId, onBack, onActivate, isLoading }: ProjectDetailProps) {
  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto animate-pulse">
        <div className="h-6 w-32 bg-slate-200 mb-8 border-2 border-slate-300"></div>
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="xl:w-2/3 space-y-8">
            <div className="h-12 w-3/4 bg-slate-200 border-2 border-slate-300"></div>
            <div className="h-24 w-full bg-slate-200 border-2 border-slate-300"></div>
            <div className="h-32 w-full bg-slate-200 border-2 border-slate-300"></div>
            <div className="h-48 w-full bg-slate-200 border-2 border-slate-300"></div>
          </div>
          <div className="xl:w-1/3">
            <div className="h-96 w-full bg-slate-200 border-2 border-slate-300"></div>
          </div>
        </div>
      </div>
    );
  }

  const project = mockProjects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-bold uppercase text-sm tracking-wider transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="border-2 border-dashed border-red-400 bg-red-50 p-8 text-center">
          <p className="font-mono text-red-600 font-bold">ERROR: PROJECT_NOT_FOUND</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold uppercase text-sm tracking-wider transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Main Content */}
        <div className="xl:w-2/3 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-4xl font-bold uppercase tracking-tight">{project.title}</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 font-mono text-xs font-bold uppercase">
                High Match
              </span>
            </div>
            <p className="text-slate-700 text-lg leading-relaxed">{project.description}</p>
          </div>

          {/* AI Strategic Reasoning */}
          <div className="border-2 border-dashed border-blue-400 bg-blue-50 p-6 relative">
            <div className="absolute -top-3 left-4 bg-blue-50 px-2 flex items-center gap-2 text-blue-700 font-bold uppercase text-xs tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              AI Strategic Reasoning
            </div>
            <p className="font-mono text-sm text-blue-900 leading-relaxed pt-2">
              {project.reasoning}
            </p>
          </div>

          {/* AI Generated Initiatives */}
          <div className="border-2 border-slate-900 bg-white p-6">
            <h3 className="font-bold uppercase text-lg tracking-wider mb-4 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <Target className="w-5 h-5 text-emerald-600" />
              AI-Generated Initiatives
            </h3>
            <ul className="space-y-3">
              {project.initiatives.map((initiative, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="font-mono text-emerald-600 font-bold mt-0.5">[{idx + 1}]</span>
                  <span className="text-slate-800">{initiative}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Technical Tips */}
            <div className="border-2 border-slate-900 bg-slate-900 text-white p-6">
              <h3 className="font-bold uppercase text-lg tracking-wider mb-4 flex items-center gap-2 border-b-2 border-slate-700 pb-2">
                <Code className="w-5 h-5 text-blue-400" />
                Technical Tips
              </h3>
              <ul className="space-y-4">
                {project.technicalTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-blue-400 mt-1">{`>`}</span>
                    <span className="font-mono text-sm text-slate-300 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Overall Tips */}
            <div className="border-2 border-slate-900 bg-amber-50 p-6">
              <h3 className="font-bold uppercase text-lg tracking-wider mb-4 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                Overall Strategy
              </h3>
              <ul className="space-y-4">
                {project.overallTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span className="text-slate-800 text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar / Team */}
        <div className="xl:w-1/3 space-y-6">
          <div className="border-2 border-slate-900 bg-slate-50 p-6 sticky top-8">
            <h4 className="font-bold uppercase text-sm tracking-wider mb-4 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <Users className="w-4 h-4" />
              Assigned Team
            </h4>
            
            <div className="space-y-3 mb-8">
              {project.suggestedMembers.map(memberId => {
                const member = mockMembers.find(m => m.id === memberId);
                if (!member) return null;
                return (
                  <div key={member.id} className="flex items-center gap-3 bg-white border-2 border-slate-900 p-3">
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 border-2 border-slate-900" />
                    <div>
                      <div className="font-bold text-sm">{member.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{member.handle}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-8">
              <h4 className="font-bold uppercase text-xs text-slate-500 tracking-wider mb-3">Required DNA</h4>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map(skill => (
                  <span key={skill} className="px-2 py-1 border border-slate-900 bg-white font-mono text-xs text-slate-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onActivate(project.title)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 border-2 border-slate-900 transition-colors uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              <CheckCircle2 className="w-5 h-5" />
              Activate Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
