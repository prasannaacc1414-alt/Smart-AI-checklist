import React from 'react';
import { Bot, Sparkles, LogOut, Lock, Home } from 'lucide-react';
import { User } from 'firebase/auth';

interface WorkspaceHeaderProps {
  user: User;
  sessionTimeRemaining: number;
  onLogout: () => void;
  onNavigate: (screen: 'home' | 'privacy' | 'terms') => void;
}

export default function WorkspaceHeader({
  user,
  sessionTimeRemaining,
  onLogout,
  onNavigate,
}: WorkspaceHeaderProps) {
  // Format remaining seconds into MM:SS
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = sessionTimeRemaining < 300; // < 5 minutes remaining

  return (
    <header id="app-nav-bar" className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Clickable logo to navigate back to Homepage */}
          <button 
            onClick={() => onNavigate('home')} 
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20 cursor-pointer transition-colors"
            title="Return to Homepage"
          >
            <Bot size={20} />
          </button>
          <div>
            <h1 className="font-display font-bold text-slate-800 tracking-tight text-base flex items-center gap-1">
              Smart AI <Sparkles size={12} className="text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">AI Workspace Mode</p>
          </div>
        </div>

        {/* Secure Session Countdown & User Status */}
        <div className="flex items-center gap-4">
          {/* Session Expire Ticker with Shield icon */}
          <div 
            id="session-countdown-ticker" 
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              isTimeCritical
                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                : 'bg-indigo-50/50 border-indigo-100/60 text-indigo-700'
            }`}
            title="Secured Login Duration (Automatic 1-hour security force expiry)"
          >
            <Lock size={12} className={isTimeCritical ? 'text-rose-500' : 'text-indigo-500'} />
            <span>SECURE SESSION: {formatTime(sessionTimeRemaining)}</span>
          </div>

          {/* Profile Avatar / logout */}
          <div id="user-profile-controls" className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
            <div className="hidden min-[400px]:flex flex-col items-end text-right min-w-0 shrink">
              <span className="text-xs font-semibold text-slate-700 truncate w-full max-w-[70px] min-[480px]:max-w-[110px] sm:max-w-[180px] md:max-w-[240px]">
                {user.displayName || 'App User'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate w-full max-w-[70px] min-[480px]:max-w-[110px] sm:max-w-[180px] md:max-w-[240px]">
                {user.email}
              </span>
            </div>
            {user.photoURL ? (
              <img
                id="user-avatar-img"
                src={user.photoURL}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full border border-slate-200/80 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center border border-slate-200/80">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
            
            {/* Return to Home link */}
            <button
              onClick={() => onNavigate('home')}
              title="Go to Homepage"
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-transparent"
            >
              <Home size={16} />
            </button>

            <button
              id="logout-btn"
              type="button"
              onClick={onLogout}
              title="Log out of applet"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100/50"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
