import React from 'react';
import { Github, Sparkles, BrainCircuit, Activity, BookOpen, Fingerprint } from 'lucide-react';

export function Login() {
  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_github_client_id_here';
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || (window.location.origin + '/auth/callback');
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user%20repo%20read:org`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-slate-900 w-full max-w-5xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row h-auto md:h-[600px]">
        {/* Left Side - Marketing / Visuals */}
        <div className="w-full md:w-1/2 p-12 bg-slate-900 text-white flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="w-[150%] h-[150%] -top-1/4 -left-1/4 absolute bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent animate-pulse delay-700"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <BrainCircuit className="w-10 h-10 text-blue-400" />
              <span className="text-2xl font-bold tracking-tight uppercase">Communa AI</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight mb-6">
              Your Open Source <br />
              <span className="text-blue-400 font-mono inline-flex items-center gap-2 border-b-4 border-blue-400 pb-1">DNA<Fingerprint className="w-8 h-8"/></span>
            </h1>
            
            <p className="text-slate-400 font-mono text-sm leading-relaxed mb-12">
              A meritocratic intelligence platform. We map organizational talent and use AI 
              to match engineers with high-impact initiatives based on their semantic footprint.
            </p>
          </div>

          <div className="mt-auto relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 border l border-slate-700">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Passive Skill Extraction</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 border border-slate-700">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">AI Team Topology</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 border border-slate-700">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Merit-Based Discovery</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white relative">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-slate-900 mb-2">Access Portal</h2>
              <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Identify to continue</p>
            </div>

            <button
              onClick={handleGithubLogin}
              className="w-full relative group block"
            >
              <div className="absolute inset-0 bg-blue-600 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-slate-900"></div>
              <div className="relative flex items-center justify-center gap-3 border-2 border-slate-900 bg-white p-4 font-bold text-slate-900 uppercase text-sm tracking-wider hover:bg-slate-50 transition-colors">
                <Github className="w-6 h-6" />
                Authenticate Via GitHub
              </div>
            </button>
            <p className="mt-6 text-center text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              Requires public repository access for AI modeling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
