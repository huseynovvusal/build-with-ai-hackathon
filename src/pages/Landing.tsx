import { Link } from 'react-router-dom';
import { Users, Zap, Github, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Build the perfect team, <br className="hidden md:block" />
          <span className="text-accent">effortlessly.</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-10">
          Community Match is the intelligent platform for organizers to find the right talent, form balanced teams, and kickstart projects instantly.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user ? (
            <Link to="/dashboard" className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors shadow-lg shadow-accent/20">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors shadow-lg shadow-accent/20">
                Get Started Free
              </Link>
              <Link to="/login" className="bg-surface border border-border hover:bg-border text-text-primary px-8 py-4 rounded-xl text-lg font-medium transition-colors">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-surface border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="text-text-secondary mt-4">From idea to execution in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-bg p-8 rounded-2xl border border-border">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Define Requirements</h3>
              <p className="text-text-secondary leading-relaxed">
                Create a project and specify the exact skills, roles, and team size you need.
              </p>
            </div>

            <div className="bg-bg p-8 rounded-2xl border border-border">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Smart Matching</h3>
              <p className="text-text-secondary leading-relaxed">
                Our algorithm scores community members based on skill overlap, availability, and activity.
              </p>
            </div>

            <div className="bg-bg p-8 rounded-2xl border border-border">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Github className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Instant Kickoff</h3>
              <p className="text-text-secondary leading-relaxed">
                Approve a team and automatically generate a GitHub repository with starter issues.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
