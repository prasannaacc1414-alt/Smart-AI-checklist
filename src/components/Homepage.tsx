import React from 'react';
import { Bot, Sparkles, CheckSquare, ShieldCheck, ArrowRight, FileSpreadsheet, KeyRound, Mic } from 'lucide-react';

interface HomepageProps {
  onSignIn: () => void;
  onNavigate: (screen: 'privacy' | 'terms' | 'workspace') => void;
  isLoggedIn: boolean;
}

export default function Homepage({ onSignIn, onNavigate, isLoggedIn }: HomepageProps) {
  return (
    <div id="homepage-landing-screen" className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-3xl -z-10"></div>

      {/* Landing Navigation Header */}
      <header id="homepage-nav" className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200/50 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo representing AI with animated glowing rings */}
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 relative group">
              <Bot size={20} className="relative z-10 animate-pulse" />
              <div className="absolute inset-0 rounded-xl bg-blue-400 opacity-20 blur group-hover:scale-125 transition-transform"></div>
            </div>
            <div>
              <h1 className="font-display font-bold text-slate-800 tracking-tight text-base flex items-center gap-1">
                Smart AI <Sparkles size={12} className="text-amber-500 fill-amber-500" />
              </h1>
              <p className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">AI Checklist Core</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('privacy')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer hidden sm:block"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer hidden sm:block"
            >
              Terms of Service
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => onNavigate('workspace')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Go to Workspace</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={onSignIn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Core Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center justify-center space-y-12">
        <div className="space-y-4 max-w-3xl">
          {/* Custom Crafted AI Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-[11px] font-bold tracking-wide uppercase font-mono shadow-sm">
            <Bot size={13} className="text-blue-600 animate-bounce" />
            <span>Smart AI Core Engine Enabled</span>
          </div>

          <h2 className="font-display font-extrabold text-slate-900 text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] max-w-2xl mx-auto">
            Your Checklist, Powered by <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Smart AI</span>
          </h2>
          
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            A secured, direct-integration checklist platform that links seamlessly to your Google Sheets as a database, backed by Google Gemini AI assistant and local token encryption.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          {isLoggedIn ? (
            <button
              onClick={() => onNavigate('workspace')}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Launch AI Workspace</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-3"
            >
              {/* Google Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Connect Google Account</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('privacy')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} className="text-slate-400" />
            <span>Privacy Standards</span>
          </button>
        </div>

        {/* Feature Grid with security features explicitly shown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 text-left">
          
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 relative group hover:shadow-md hover:border-slate-300/80 transition-all duration-200">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/30">
              <Bot size={20} className="animate-pulse" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Smart AI Organizing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use voice or text to query your checklist. Gemini AI acts as your personal command assistant, instantly sorting and logging tasks using dates.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 relative group hover:shadow-md hover:border-slate-300/80 transition-all duration-200">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/30">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Google Sheets Database</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Keep full control of your databases. The application initializes and logs checklist tasks directly to a dedicated sheet in your own Google Drive.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 relative group hover:shadow-md hover:border-slate-300/80 transition-all duration-200">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/30">
              <KeyRound size={18} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Hacker-Proof Security</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Google token storage is secured with unique client browser key encryption and a strict 1-hour session timer to safeguard against malicious hijacks.
            </p>
          </div>

        </div>
      </main>

      {/* Footer Navigation */}
      <footer id="homepage-footer" className="bg-white border-t border-slate-100 py-6 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© 2026 Smart AI Checklist. Developed with Direct Drive Sandboxing.</p>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-600 transition-colors cursor-pointer">Privacy Policy</button>
            <span className="text-slate-200">•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-600 transition-colors cursor-pointer">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
