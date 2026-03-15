import { useState, useEffect } from 'react';
import { Search, Filter, Github, Clock, Activity } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  githubUsername: string | null;
  role: string;
  timezone: string | null;
  availabilityHours: number;
  lastActiveAt: string | null;
  skills: string[];
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [roleFilter, skillFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (skillFilter) params.append('skill', skillFilter);
      
      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch members', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community Directory</h1>
          <p className="text-text-secondary mt-1">Find the perfect teammates for your next project.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search members..."
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none w-full sm:w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-surface border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="member">Members</option>
            <option value="organizer">Organizers</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div key={member.id} className="bg-surface border border-border rounded-2xl p-6 hover:border-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-border rounded-md text-text-secondary uppercase tracking-wider">
                    {member.role}
                  </span>
                </div>
                {member.githubUsername && (
                  <a href={`https://github.com/${member.githubUsername}`} target="_blank" rel="noreferrer" className="text-text-secondary hover:text-white">
                    <Github className="w-5 h-5" />
                  </a>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>{member.availabilityHours} hrs/week</span>
                  <span className="mx-1">•</span>
                  <span>{member.timezone || 'UTC'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Activity className="w-4 h-4" />
                  <span>Activity Score: {member.lastActiveAt ? 'High' : 'Medium'}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">Top Skills</div>
                <div className="flex flex-wrap gap-2">
                  {member.skills.slice(0, 5).map(skill => (
                    <span key={skill} className="px-2.5 py-1 rounded-md text-xs bg-bg border border-border text-text-primary">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 5 && (
                    <span className="px-2.5 py-1 rounded-md text-xs bg-bg border border-border text-text-secondary">
                      +{member.skills.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-20 text-text-secondary border border-dashed border-border rounded-2xl">
              No members found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
