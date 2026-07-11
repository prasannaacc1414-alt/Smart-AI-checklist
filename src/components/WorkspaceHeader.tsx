import React, { useState } from 'react';
import { Bot, Sparkles, LogOut, Lock, Home, Key, X, Eye, EyeOff, Trash2, Check } from 'lucide-react';
import { User } from 'firebase/auth';
import KeyGuidanceModal from './KeyGuidanceModal';

interface WorkspaceHeaderProps {
  user: User;
  sessionTimeRemaining: number;
  userGeminiApiKey: string;
  onSaveGeminiApiKey: (key: string) => void;
  onLogout: () => void;
  onNavigate: (screen: 'home' | 'privacy' | 'terms') => void;
}

export default function WorkspaceHeader({
  user,
  sessionTimeRemaining,
  userGeminiApiKey,
  onSaveGeminiApiKey,
  onLogout,
  onNavigate,
}: WorkspaceHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [inputKey, setInputKey] = useState(userGeminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Format remaining seconds into MM:SS
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = sessionTimeRemaining < 300; // < 5 minutes remaining

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGeminiApiKey(inputKey);
    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
      setIsSettingsOpen(false);
    }, 1200);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveGeminiApiKey('');
  };

  const hasApiKey = userGeminiApiKey.trim().length > 0;

  return (
    <>
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
              
              {/* Custom Gemini API Key Settings Button */}
              <button
                onClick={() => {
                  setInputKey(userGeminiApiKey);
                  setIsSettingsOpen(true);
                }}
                title="AI Assistant Settings (Custom Gemini Key)"
                className={`p-2 rounded-xl transition-all cursor-pointer border border-transparent flex items-center justify-center relative ${
                  hasApiKey 
                    ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 bg-emerald-50/40' 
                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Key size={16} />
                {!hasApiKey && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white animate-pulse" />
                )}
              </button>

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

      {/* Elegant Gemini API Key Settings Modal overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Decorative colored bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />
            
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Key size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-lg">AI Assistant Settings</h3>
                <p className="text-xs text-slate-400">Configure your personal Gemini API key</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              To keep this app 100% free and secure for public use, we use a <strong>standalone custom key model</strong>. Your API key remains <strong>entirely inside your browser</strong> and is only used to authenticate your requests.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Gemini API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? "text" : "password"}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-50 border border-slate-200 pl-3.5 pr-12 py-2.5 rounded-xl text-xs font-mono transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="absolute right-2.5 flex items-center gap-1.5">
                    {inputKey && (
                      <button
                        type="button"
                        onClick={handleClear}
                        title="Clear API Key"
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      title={showKey ? "Hide key" : "Show key"}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    >
                      {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Get key instructions link */}
              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-[11px] text-blue-800 leading-relaxed flex items-start gap-2">
                <span className="text-sm shrink-0">💡</span>
                <div>
                  <span className="font-semibold block mb-0.5">Need a Gemini API Key?</span>
                  You can get a personal API Key for 100% free. Click below to view the step-by-step setup guide.
                  <button 
                    type="button"
                    onClick={() => {
                      setIsGuidanceOpen(true);
                    }}
                    className="text-blue-600 hover:underline font-bold block mt-1 hover:text-blue-700 transition-colors text-left cursor-pointer"
                  >
                    Get guidance to get the key →
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavedSuccessfully}
                  className={`flex-1 py-2.5 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                    isSavedSuccessfully
                      ? 'bg-emerald-600 text-white shadow-emerald-500/15'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/15 hover:shadow-blue-500/25'
                  }`}
                >
                  {isSavedSuccessfully ? (
                    <>
                      <Check size={14} />
                      <span>Key Saved!</span>
                    </>
                  ) : (
                    <span>Activate AI</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable guidance step-by-step modal */}
      <KeyGuidanceModal isOpen={isGuidanceOpen} onClose={() => setIsGuidanceOpen(false)} />
    </>
  );
}
