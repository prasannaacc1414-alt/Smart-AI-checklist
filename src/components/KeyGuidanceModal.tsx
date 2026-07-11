import React from 'react';
import { X, Key, ExternalLink, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';

interface KeyGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyGuidanceModal({ isOpen, onClose }: KeyGuidanceModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 shadow-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[80vh] flex flex-col relative overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top colorful gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shrink-0" />
        
        {/* Header - Fixed on top */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 relative mt-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl border border-blue-100">
              <Key size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base sm:text-lg">Gemini API Key Guide</h3>
              <p className="text-[11px] text-slate-400">Get your free key in less than 60 seconds</p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            title="Close guidance modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 scrollbar-thin">
          {/* Explanatory introduction */}
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            To ensure this workspace remains completely free, open-source, and secure, the AI features run on your own client-side <strong>Gemini API key</strong>. It acts as your personal passport to access Google's advanced intelligence.
          </p>

          {/* Step-by-Step Guidance */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-800">Visit Google AI Studio</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Open the official AI Studio dashboard where Google allows developers and users to build. It is 100% free.
                </p>
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-xs mt-1.5 hover:underline"
                >
                  Go to Google AI Studio <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-800">Sign In with your Google Account</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Log in using your existing standard Gmail / Google account. <strong>No credit cards or billing setup</strong> are required to use the free tier.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-800">Click "Get API Key"</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Locate and click the prominent blue button labeled <strong>"Get API key"</strong> or <strong>"Create API key"</strong> in the sidebar menu.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-800">Select "Create API key in new project"</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Choose the option to create a key in a new project. Google will automatically provision a secure workspace space and generate your unique key.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
                5
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-800">Copy the Key & Paste in App</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Copy the text string starting with <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono text-slate-800">AIzaSy...</code>, return here, and paste it into the AI settings modal or panel to activate your workspace instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Security and Free Tier Info */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start gap-2.5 text-slate-700">
              <CheckCircle size={14} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-slate-800">Generous Free Limits:</strong> The key runs on the free tier of Gemini, allowing up to 15 Requests Per Minute (RPM), which is more than enough for regular daily planning.
              </p>
            </div>
            <div className="flex items-start gap-2.5 text-slate-700">
              <ShieldCheck size={14} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                <strong className="text-slate-800">100% Client-Side Privacy:</strong> Your key is stored purely inside your own browser's local storage. It is never saved on external servers, keeping your account safe and private.
              </p>
            </div>
          </div>
        </div>

        {/* Persistent Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Got it, thanks!</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
