import React, { useState } from 'react';
import { Github, Terminal, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [orgName, setOrgName] = useState('BANM-OpenSource');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md border-2 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center gap-3 mb-8">
          <Terminal className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight uppercase">Communa AI</h1>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold font-mono uppercase text-slate-500 mb-2">Target Organization</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border-2 border-slate-900 bg-slate-50 text-slate-900 font-mono focus:outline-none focus:ring-0 focus:border-blue-600 transition-colors"
                placeholder="github-org-name"
              />
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 border-2 border-slate-900 transition-colors uppercase tracking-wider"
          >
            Initialize Sync
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300">
          <p className="text-xs font-mono text-slate-500">
            SYSTEM STATUS: <span className="text-emerald-600 font-bold">ONLINE</span><br/>
            AUTH MODULE: <span className="text-slate-900">READY</span>
          </p>
        </div>
      </div>
    </div>
  );
}
