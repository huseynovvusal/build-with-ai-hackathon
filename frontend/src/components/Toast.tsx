import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] p-4 flex items-start gap-4 max-w-md">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold uppercase text-sm tracking-wider mb-1">System Notification</h4>
          <p className="text-slate-300 text-sm font-mono leading-relaxed">{message}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
