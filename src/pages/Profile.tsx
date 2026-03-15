import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, X, Save } from 'lucide-react';

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'Docker', 'TypeScript',
  'Tailwind CSS', 'PostgreSQL', 'FastAPI', 'Machine Learning',
  'Kubernetes', 'GitHub Actions', 'Agile', 'Next.js', 'React Native',
  'Spring Boot', 'Playwright', 'Cypress', 'OWASP', 'AppSec'
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    githubUsername: '',
    timezone: 'Asia/Baku',
    availabilityHours: '0'
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        githubUsername: user.githubUsername || '',
        timezone: user.timezone || 'Asia/Baku',
        availabilityHours: user.availabilityHours?.toString() || '0'
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleAddSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, skills })
      });

      if (!res.ok) throw new Error('Failed to update profile');

      // Refresh user data
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      updateUser(meData);

      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50' : 'bg-red-500/10 text-red-500 border border-red-500/50'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email address</label>
              <input
                type="email"
                disabled
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-secondary opacity-50 cursor-not-allowed"
                value={user.email}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">GitHub Username</label>
              <input
                type="text"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                value={formData.githubUsername}
                onChange={e => setFormData({...formData, githubUsername: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Timezone</label>
              <input
                type="text"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                value={formData.timezone}
                onChange={e => setFormData({...formData, timezone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Availability (Hours/Week)</label>
              <input
                type="number"
                min="0"
                max="168"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                value={formData.availabilityHours}
                onChange={e => setFormData({...formData, availabilityHours: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Skills & Technologies</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-accent/20 text-accent border border-accent/30">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput.trim());
                  }
                }}
                list="skills-suggestions"
              />
              <datalist id="skills-suggestions">
                {COMMON_SKILLS.filter(s => !skills.includes(s)).map(s => <option key={s} value={s} />)}
              </datalist>
              <button
                type="button"
                onClick={() => handleAddSkill(skillInput.trim())}
                className="bg-surface border border-border hover:bg-border px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
