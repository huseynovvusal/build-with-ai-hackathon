import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, Users, Copy, Check } from 'lucide-react';

interface TeamMember {
  userId: string;
  name: string;
  assignedRole: string;
  score: number;
  matchedTech: string[];
  whySelected: string[];
}

interface Recommendation {
  id: string;
  variant: string;
  team: TeamMember[];
  coverageReport: {
    covered: string[];
    missing: string[];
  };
}

export default function ProjectRecommendations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('A');
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectAndRecommendations();
  }, [id]);

  const fetchProjectAndRecommendations = async () => {
    try {
      const projRes = await fetch(`/api/projects/${id}`);
      const projData = await projRes.json();
      setProject(projData);

      if (projData.status === 'draft') {
        const recRes = await fetch(`/api/projects/${id}/recommendations`, { method: 'POST' });
        const recData = await recRes.json();
        setRecommendations(recData);
      } else {
        // Already approved, redirect to kickoff
        navigate(`/projects/${id}/kickoff`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const selectedTeam = recommendations.find(r => r.variant === selectedVariant)?.team;
    if (!selectedTeam) return;

    setApproving(true);
    try {
      await fetch(`/api/projects/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamMembers: selectedTeam })
      });
      
      // Send invites
      await fetch(`/api/projects/${id}/invites/send`, { method: 'POST' });
      
      navigate(`/projects/${id}/kickoff`);
    } catch (error) {
      console.error(error);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
        <h2 className="text-xl font-semibold">Analyzing community profiles...</h2>
        <p className="text-text-secondary mt-2">Matching skills, availability, and activity.</p>
      </div>
    );
  }

  if (!project || recommendations.length === 0) return <div>Error loading recommendations</div>;

  const currentRec = recommendations.find(r => r.variant === selectedVariant)!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Recommendations</h1>
        <p className="text-text-secondary">Based on requirements for <span className="text-white font-medium">{project.title}</span></p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-border pb-4">
        {recommendations.map(rec => (
          <button
            key={rec.variant}
            onClick={() => setSelectedVariant(rec.variant)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedVariant === rec.variant 
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'bg-surface border border-border text-text-secondary hover:text-white hover:border-accent/50'
            }`}
          >
            Team Option {rec.variant}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" /> Proposed Team
          </h2>
          
          <div className="grid gap-4">
            {currentRec.team.map(member => (
              <div key={member.userId} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{member.name}</h3>
                    <p className="text-sm text-accent font-medium">{member.assignedRole}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{Math.round(member.score)}</div>
                    <div className="text-xs text-text-secondary uppercase tracking-wider">Match Score</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-text-secondary mb-1">Why Selected:</div>
                    <ul className="space-y-1">
                      {member.whySelected.map((reason, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-text-primary">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {member.matchedTech.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-text-secondary mb-1">Matched Tech:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {member.matchedTech.map(tech => (
                          <span key={tech} className="px-2 py-0.5 rounded text-xs bg-bg border border-border text-text-secondary">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Coverage Report</h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Covered Tech
                  </span>
                  <span className="text-xs text-text-secondary">{currentRec.coverageReport.covered.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentRec.coverageReport.covered.map(tech => (
                    <span key={tech} className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {tech}
                    </span>
                  ))}
                  {currentRec.coverageReport.covered.length === 0 && <span className="text-xs text-text-secondary">None</span>}
                </div>
              </div>

              {currentRec.coverageReport.missing.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Missing Tech
                    </span>
                    <span className="text-xs text-text-secondary">{currentRec.coverageReport.missing.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRec.coverageReport.missing.map(tech => (
                      <span key={tech} className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-500 border border-red-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="w-full flex justify-center items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Approve Team Option ' + selectedVariant}
              </button>
              <p className="text-xs text-center text-text-secondary mt-3">
                This will finalize the team and prepare invitation messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
