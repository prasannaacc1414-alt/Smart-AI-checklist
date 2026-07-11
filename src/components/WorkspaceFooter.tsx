import React from 'react';

interface WorkspaceFooterProps {
  onNavigate: (screen: 'home' | 'privacy' | 'terms') => void;
}

export default function WorkspaceFooter({ onNavigate }: WorkspaceFooterProps) {
  return (
    <footer id="app-general-footer" className="bg-white border-t border-slate-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
        <p>© 2026 Smart AI Checklist. Dedicated Secure Iframe Sandbox.</p>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('privacy')} className="hover:text-slate-600 transition-colors cursor-pointer">Privacy Policy</button>
          <span className="text-slate-200">•</span>
          <button onClick={() => onNavigate('terms')} className="hover:text-slate-600 transition-colors cursor-pointer">Terms of Service</button>
        </div>
      </div>
    </footer>
  );
}
