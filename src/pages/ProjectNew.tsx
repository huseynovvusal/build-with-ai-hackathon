import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, X } from 'lucide-react';

export default function ProjectNew() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teamSize: '3'
  });
  const [techTags, setTechTags] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddTech = () => {
    if (techInput.trim() && !techTags.includes(techInput.trim())) {
      setTechTags([...techTags, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleAddRole = () => {
    if (roleInput.trim() && !roles.includes(roleInput.trim())) {
      setRoles([...roles, roleInput.trim()]);
      setRoleInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (techTags.length === 0 || roles.length === 0) {
      setError('Please add at least one technology and one role.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mustHaveTech: techTags,
          rolesNeeded: roles
        })
      });

      if (!res.ok) throw new Error('Failed to create project');
      const project = await res.json();
      
      // Navigate to recommendations
      navigate(`/projects/${project.id}/recommendations`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Create New Project</h1>
        <p className="text-text-secondary mb-8">Define your project requirements to find the perfect team.</p>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Project Title</label>
            <input
              type="text"
              required
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., EcoTrack Baku"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the project goals and requirements..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Must-Have Technologies</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {techTags.map(tech => (
                  <span key={tech} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-accent/20 text-accent border border-accent/30">
                    {tech}
                    <button type="button" onClick={() => setTechTags(techTags.filter(t => t !== tech))} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent outline-none"
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                  placeholder="e.g., React, Node.js"
                />
                <button type="button" onClick={handleAddTech} className="bg-surface border border-border hover:bg-border px-3 py-2 rounded-lg text-sm font-medium">
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Roles Needed</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {roles.map(role => (
                  <span key={role} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-surface border border-border text-text-primary">
                    {role}
                    <button type="button" onClick={() => setRoles(roles.filter(r => r !== role))} className="hover:text-text-secondary">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent outline-none"
                  value={roleInput}
                  onChange={e => setRoleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole(); } }}
                  placeholder="e.g., Frontend Developer"
                />
                <button type="button" onClick={handleAddRole} className="bg-surface border border-border hover:bg-border px-3 py-2 rounded-lg text-sm font-medium">
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Target Team Size</label>
            <input
              type="number"
              min="1"
              max="10"
              required
              className="w-full sm:w-1/3 bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
              value={formData.teamSize}
              onChange={e => setFormData({...formData, teamSize: e.target.value})}
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Team Recommendations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
