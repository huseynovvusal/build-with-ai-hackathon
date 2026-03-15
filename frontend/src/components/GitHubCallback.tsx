import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { BrainCircuit } from 'lucide-react';

interface GitHubCallbackProps {
  onComplete: () => void;
}

export function GitHubCallback({ onComplete }: GitHubCallbackProps) {
  const { login } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        console.error('No code found in URL');
        onComplete();
        return;
      }

      try {
        const data = await authApi.exchangeGitHubCode(code);
        login(data.access, data.refresh, data.member);
        window.history.replaceState({}, document.title, '/'); // Clean URL
        onComplete();
      } catch (err) {
        console.error('Failed to exchange code:', err);
        onComplete();
      }
    };

    processCallback();
  }, [login, onComplete]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="border-4 border-slate-900 p-12 max-w-md w-full text-center flex flex-col items-center">
        <BrainCircuit className="w-16 h-16 text-blue-600 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Authenticating...</h2>
        <p className="text-slate-500 font-mono text-sm leading-relaxed">
          Exchanging secure tokens with GitHub and analyzing your public footprint.
        </p>
      </div>
    </div>
  );
}
