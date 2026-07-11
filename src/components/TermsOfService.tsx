import React from 'react';
import { ArrowLeft, BookOpen, AlertCircle, Sparkles, Scale } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div id="terms-of-service-screen" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Application</span>
          </button>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs font-mono uppercase tracking-wider">
            <Scale size={14} className="text-blue-500" />
            <span>Legal Center</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6 text-center sm:text-left">
            <h1 className="font-display font-bold text-slate-900 text-3xl tracking-tight mb-2">Terms of Service</h1>
            <p className="text-xs text-slate-400 font-medium font-mono">Effective Date: July 11, 2026</p>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-100/50 rounded-2xl flex gap-3 text-amber-800 text-xs leading-relaxed">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Please Read Carefully</span>
              By authenticating with Google and accessing this smart planning system, you agree to these dynamic terms of service. If you do not agree, please do not authorize sheets access or use voice dictation.
            </div>
          </div>

          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-display font-bold text-slate-800 text-lg tracking-tight">1. Services Provided</h2>
              <p>
                Smart AI Checklist provides an interactive visual workspace interface that reads and writes structured items directly to your Google Sheets account. Key aspects of the services include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Interactive Task Planning:</strong> Voice dictation parsing, date-sorting, and AI-categorized tab structures (Pending all, Completed all, Pending next, All).</li>
                <li><strong>Gemini AI Model Syncing:</strong> Natural language analysis and quick suggestions parsed using the Google GenAI API platform.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display font-bold text-slate-800 text-lg tracking-tight">2. Use of API Keys & Sheets Authorization</h2>
              <p>
                The user maintains absolute control of their personal keys, authorization credentials, and spreadsheet documents:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>You acknowledge that you authorize the application to access Google Drive only to initialize and write rows to the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">Smart Checklist</code> sheet file.</li>
                <li>We do not monitor or control what items you write, nor are we liable if you corrupt your personal spreadsheet columns by editing headers manually inside Google Drive.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display font-bold text-slate-800 text-lg tracking-tight">3. Security Responsibilities</h2>
              <p>
                Our system enforces advanced client-side encryptions and session-expiration routines to combat malware, cookie interception, and hacker attacks. However, you acknowledge the following responsibilities:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Session Expiry:</strong> Sessions automatically terminate after 1 hour. You will be prompted to log back in after this period to re-cipher access tokens.</li>
                <li><strong>Safe Terminals:</strong> Do not use this tool on public computers with automated cookies or storage scraping extensions enabled.</li>
                <li><strong>Database Isolation:</strong> We make direct client-to-API requests. We never inspect or mirror your database onto our own external databases.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display font-bold text-slate-800 text-lg tracking-tight">4. Limitations of Liability & Warranty</h2>
              <p>
                This application and its smart planning engine are provided on an "as is" and "as available" basis, without warranties of any kind. Google Gemini and Sheets services are third-party services, and we are not liable for their service availability, limits, rate-capping, or data interruptions.
              </p>
            </section>
          </div>

          <div className="border-t border-slate-100 pt-6 flex justify-between items-center flex-wrap gap-4">
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400">
              <Sparkles size={14} className="text-amber-500 fill-amber-500" />
              Secured Workspace v1.4
            </span>
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Accept & Close</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
