import React, { useState } from 'react';
import { mockMembers } from '../mockData';
import { Trophy, TrendingUp, TrendingDown, Minus, GitCommit, GitPullRequest, CircleDot, MessageSquare } from 'lucide-react';

type Timeframe = 'weekly' | 'monthly' | 'lifetime';

interface MeritocracyTableProps {
  isLoading?: boolean;
}

export function MeritocracyTable({ isLoading }: MeritocracyTableProps = {}) {
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');

  const sortedMembers = [...mockMembers].sort((a, b) => b.stats[timeframe].score - a.stats[timeframe].score);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-900 pb-4 gap-4">
          <div className="h-10 w-80 bg-slate-200 animate-pulse border-2 border-slate-300"></div>
          <div className="h-10 w-64 bg-slate-200 animate-pulse border-2 border-slate-300"></div>
        </div>
        <div className="border-2 border-slate-300 bg-slate-50 animate-pulse">
          <div className="h-12 border-b-2 border-slate-300 bg-slate-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-slate-200 flex items-center px-4 gap-4">
              <div className="h-6 w-8 bg-slate-300"></div>
              <div className="h-10 w-10 bg-slate-300 rounded-full"></div>
              <div className="h-6 w-32 bg-slate-300"></div>
              <div className="h-6 w-full bg-slate-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-900 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Meritocracy Leaderboard
          </h2>
          <p className="text-slate-500 font-mono text-sm mt-2">Data-driven contributor rankings based on impact and activity</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex border-2 border-slate-900 bg-white">
          {(['weekly', 'monthly', 'lifetime'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 font-bold uppercase text-xs tracking-wider border-r-2 border-slate-900 last:border-r-0 transition-colors ${
                timeframe === tf 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="border-2 border-slate-900 bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-900">
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-500 border-r-2 border-slate-900 w-16 text-center">Rank</th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-500 border-r-2 border-slate-900">Contributor</th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-500 border-r-2 border-slate-900 text-right">
                <div className="flex items-center justify-end gap-2">
                  <GitCommit className="w-4 h-4" /> Commits
                </div>
              </th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-500 border-r-2 border-slate-900 text-right">
                <div className="flex items-center justify-end gap-2">
                  <GitPullRequest className="w-4 h-4" /> PRs Merged
                </div>
              </th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-500 border-r-2 border-slate-900 text-right">
                <div className="flex items-center justify-end gap-2">
                  <CircleDot className="w-4 h-4" /> Issues
                </div>
              </th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-500 border-r-2 border-slate-900 text-right">
                <div className="flex items-center justify-end gap-2">
                  <MessageSquare className="w-4 h-4" /> Reviews
                </div>
              </th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-900 text-right bg-amber-50">Impact Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member, index) => {
              const stats = member.stats[timeframe];
              const isTop3 = index < 3;
              
              return (
                <tr key={member.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-r-2 border-slate-900 text-center">
                    <span className={`font-mono font-bold text-lg ${
                      index === 0 ? 'text-amber-500' : 
                      index === 1 ? 'text-slate-400' : 
                      index === 2 ? 'text-amber-700' : 'text-slate-900'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="p-4 border-r-2 border-slate-900">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 border-2 border-slate-900 bg-white" />
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          {member.name}
                          {isTop3 && <Trophy className={`w-3 h-3 ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : 'text-amber-700'}`} />}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">{member.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-r-2 border-slate-900 text-right font-mono text-sm text-slate-700">{stats.commits}</td>
                  <td className="p-4 border-r-2 border-slate-900 text-right font-mono text-sm text-slate-700">{stats.prs}</td>
                  <td className="p-4 border-r-2 border-slate-900 text-right font-mono text-sm text-slate-700">{stats.issues}</td>
                  <td className="p-4 border-r-2 border-slate-900 text-right font-mono text-sm text-slate-700">{stats.reviews}</td>
                  <td className="p-4 text-right bg-amber-50/30">
                    <div className="flex items-center justify-end gap-3">
                      {index === 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : 
                       index > 2 ? <TrendingDown className="w-4 h-4 text-red-500" /> : 
                       <Minus className="w-4 h-4 text-slate-400" />}
                      <span className="font-mono font-bold text-lg text-blue-600">{stats.score}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
