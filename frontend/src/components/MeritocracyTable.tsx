import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, GitCommit, Search, Activity } from 'lucide-react';
import { membersApi } from '../api/members';

type Timeframe = 'weekly' | 'monthly' | 'lifetime';

export function MeritocracyTable() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly'); // Keep timeframe state if needed for other parts

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await membersApi.list();
        // Sort by impact score descending
        const sorted = data.sort((a: any, b: any) => Number(b.impact_score) - Number(a.impact_score));
        setMembers(sorted);
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // The sortedMembers based on mockData and timeframe is no longer relevant if using live data
  // const sortedMembers = [...mockMembers].sort((a, b) => b.stats[timeframe].score - a.stats[timeframe].score);

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
        
        {/* Timeframe Selector (kept for now, but might be removed if not used with live data) */}
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
                  <Search className="w-4 h-4" /> PRs Merged
                </div>
              </th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-500 border-r-2 border-slate-900 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Activity className="w-4 h-4" /> Issues
                </div>
              </th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-500 border-r-2 border-slate-900 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Activity className="w-4 h-4" /> Reviews
                </div>
              </th>
              <th className="p-4 font-bold uppercase text-xs tracking-wider text-slate-900 text-right bg-amber-50">Impact Score</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => {
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
                      <img src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.github_id}`} alt={member.name} className="w-10 h-10 border-2 border-slate-900 bg-white" />
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          {member.name}
                          {isTop3 && <Trophy className={`w-3 h-3 ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : 'text-amber-700'}`} />}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">{member.github_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-r-2 border-slate-900 text-right font-mono text-sm text-slate-700">-</td>
                  <td className="p-4 border-r-2 border-slate-900 text-right font-mono text-sm text-slate-700">-</td>
                  <td className="p-4 border-r-2 border-slate-900 text-right font-mono text-sm text-slate-700">-</td>
                  <td className="p-4 border-r-2 border-slate-900 text-right font-mono text-sm text-slate-700">-</td>
                  <td className="p-4 text-right bg-amber-50/30">
                    <div className="flex items-center justify-end gap-3">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="font-mono font-bold text-lg text-blue-600">{Number(member.impact_score).toFixed(0)}</span>
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
