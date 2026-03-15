import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, X } from 'lucide-react';

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'Docker', 'TypeScript',
  'Tailwind CSS', 'PostgreSQL', 'FastAPI', 'Machine Learning',
  'Kubernetes', 'GitHub Actions', 'Agile', 'Next.js', 'React Native',
  'Spring Boot', 'Playwright', 'Cypress', 'OWASP', 'AppSec'
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    githubUsername: '',
    timezone: 'Asia/Baku',
    availabilityHours: '10'
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, skills })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-surface p-8 rounded-2xl border border-border shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-text-primary">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Join the community and start building
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          
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
                required
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">GitHub Username (Optional)</label>
              <input
                type="text"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                value={formData.githubUsername}
                onChange={e => setFormData({...formData, githubUsername: e.target.value})}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-bg transition-colors disabled:opacity-50 mt-8"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
