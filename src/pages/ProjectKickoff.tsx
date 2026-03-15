import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Github, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';

export default function ProjectKickoff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kickoffLoading, setKickoffLoading] = useState(false);
  const [kickoffResult, setKickoffResult] = useState<any>(null);
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectAndInvites();
  }, [id]);

  const fetchProjectAndInvites = async () => {
    try {
      const projRes = await fetch(`/api/projects/${id}`);
      const projData = await projRes.json();
      setProject(projData);

      // In a real app we'd fetch invites, but here we can just generate them or fetch if they exist
      // Since we generated them in the previous step, we'll fetch them if we had an endpoint.
      // For MVP, we'll just show the team members and a generic invite message to copy.
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleKickoff = async () => {
    setKickoffLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/github/kickoff`, { method: 'POST' });
      const data = await res.json();
      setKickoffResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setKickoffLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInvite(id);
    setTimeout(() => setCopiedInvite(null), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Team Approved!</h1>
        <p className="text-text-secondary">Your team for <span className="text-white font-medium">{project.title}</span> is ready.</p>
      </div>

      <div className="grid gap-8">
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">1. Send Invitations</h2>
          <p className="text-text-secondary mb-6">Copy these personalized messages and send them to your matched team members.</p>
          
          <div className="space-y-4">
            {project.teamMembers.map((member: any) => {
              const message = `Hi ${member.user.name},\n\nYou've been matched to join "${project.title}" as a ${member.assignedRole}. Your skills are a perfect fit!\n\nAre you available to join?`;
              
              return (
                <div key={member.id} className="bg-bg border border-border rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{member.user.name} <span className="text-text-secondary font-normal">({member.assignedRole})</span></span>
                    <button
                      onClick={() => copyToClipboard(message, member.id)}
                      className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors"
                    >
                      {copiedInvite === member.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedInvite === member.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans bg-surface p-3 rounded-lg border border-border">
                    {message}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Github className="w-6 h-6" /> 2. GitHub Repository Kickoff
          </h2>
          
          {!kickoffResult ? (
            <div>
              <p className="text-text-secondary mb-6">
                Automatically create a GitHub repository for your project, complete with starter files (README, CONTRIBUTING) and initial issues for each role.
              </p>
              <button
                onClick={handleKickoff}
                disabled={kickoffLoading}
                className="flex items-center gap-2 bg-[#2ea043] hover:bg-[#2c974b] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {kickoffLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Github className="w-5 h-5" />}
                Create GitHub Repository
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-500 font-medium mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Repository Created Successfully
                  {kickoffResult.isMock && <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full border border-yellow-500/30">Mock Mode</span>}
                </div>
                <a href={kickoffResult.repoUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1">
                  {kickoffResult.repoUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">Files Created</h3>
                  <ul className="space-y-2">
                    {kickoffResult.filesCreated.map((file: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-bg border border-border px-3 py-2 rounded-lg">
                        <Check className="w-4 h-4 text-emerald-500" /> {file}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3 uppercase tracking-wider">Issues Created</h3>
                  <ul className="space-y-2">
                    {kickoffResult.issuesCreated.map((issue: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-bg border border-border px-3 py-2 rounded-lg">
                        <Check className="w-4 h-4 text-emerald-500" /> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end">
                <button
                  onClick={() => navigate('/members')}
                  className="bg-surface border border-border hover:bg-border text-text-primary px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Return to Directory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
