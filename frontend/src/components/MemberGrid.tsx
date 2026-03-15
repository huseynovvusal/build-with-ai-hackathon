import React from 'react';
import { mockMembers } from '../mockData';
import { Github, Activity } from 'lucide-react';

interface MemberGridProps {
  isLoading?: boolean;
}

export function MemberGrid({ isLoading }: MemberGridProps = {}) {
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8 flex justify-between items-end border-b-2 border-slate-900 pb-4">
          <div className="h-10 w-64 bg-slate-200 animate-pulse border-2 border-slate-300"></div>
          <div className="h-10 w-32 bg-slate-200 animate-pulse border-2 border-slate-300"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border-2 border-slate-300 bg-slate-50 p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-200 border-2 border-slate-300"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 w-3/4"></div>
                  <div className="h-3 bg-slate-200 w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="h-8 bg-slate-200 w-full"></div>
                <div className="h-8 bg-slate-200 w-full"></div>
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
          <h2 className="text-3xl font-bold uppercase tracking-tight">Member Grid</h2>
          <p className="text-slate-500 font-mono text-sm mt-2">Showing 5 active contributors from BANM-OpenSource</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 border-2 border-slate-900 px-3 py-1">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span className="font-mono text-xs font-bold uppercase">Live Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockMembers.map(member => (
          <div key={member.id} className="border-2 border-slate-900 bg-white hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-shadow">
            <div className="p-5 border-b-2 border-slate-900 flex items-start justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 border-2 border-slate-900 bg-white" />
                <div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Github className="w-3 h-3" />
                    <span className="font-mono text-xs">{member.handle}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-blue-600">{member.contributionScore}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Impact Score</div>
              </div>
            </div>
            
            <div className="p-5">
              <div className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Top Skills DNA</div>
              <div className="flex flex-wrap gap-2">
                {member.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 border border-slate-900 bg-slate-100 font-mono text-xs text-slate-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
