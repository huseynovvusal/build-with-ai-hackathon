import { Link } from 'react-router-dom';
import { Users, FolderPlus } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Community Match</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Link to="/members" className="bg-surface border border-border rounded-2xl p-8 hover:border-accent/50 transition-all group">
          <div className="bg-accent/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">View Members</h2>
          <p className="text-text-secondary">Browse the community directory, find teammates, and view profiles.</p>
        </Link>
        <Link to="/projects/new" className="bg-surface border border-border rounded-2xl p-8 hover:border-emerald-500/50 transition-all group">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FolderPlus className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Create Project</h2>
          <p className="text-text-secondary">Start a new project, define requirements, and get AI-matched team recommendations.</p>
        </Link>
      </div>
    </div>
  );
}
