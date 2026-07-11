import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div id="privacy-policy-screen" className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
            <Shield size={14} className="text-blue-500" />
            <span>Compliance Center</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-6 text-center sm:text-left">
            <h1 className="font-display font-bold text-slate-900 text-3xl tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-xs text-slate-400 font-medium font-mono">Last Updated: July 11, 2026</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
            <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex flex-col gap-2">
              <Lock size={20} className="text-blue-600" />
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Secure Storage</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Your data is stored strictly in your own Google Drive Spreadsheet. We do not maintain server-side task databases.
              </p>
            </div>
            <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex flex-col gap-2">
              <Eye size={20} className="text-emerald-600" />
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Zero Tracking</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                We never track user activity, sell metrics, or use secondary tracking scripts. Your actions are completely private.
              </p>
            </div>
            <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex flex-col gap-2">
              <Shield size={20} className="text-indigo-600" />
              <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Local Encryption</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Credentials and session details are encrypted in your local browser storage, protected from browser-based hacks.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-display font-bold text-slate-800 text-lg tracking-tight">1. Information We Collect</h2>
              <p>
                The Smart AI Checklist is designed with privacy-first architecture. It functions as a direct connection bridge between your local browser, the Google Sheets API, and Google Gemini AI services:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Google Identity & Email:</strong> Used solely to authenticate your session and authorize direct communication with your own Google Sheet files.</li>
                <li><strong>Task Checklist Data:</strong> Stored securely inside your Google Drive. The app reads and writes this data only during your active sessions.</li>
                <li><strong>Voice and Text Queries:</strong> Dictations and smart commands are sent to Google Gemini API to analyze context and organize tasks, but are never permanently logged.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display font-bold text-slate-800 text-lg tracking-tight">2. How We Protect Your Data</h2>
              <p>
                We implement several strict layers of security to defend your account from external cyber threats and malicious browser snooping:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Encrypted Tokens:</strong> Google Access Tokens and sheet references are ciphered locally using dynamic salt keys and browser signatures before writing to local storage.</li>
                <li><strong>Strict 1-Hour Session Expiry:</strong> Active login sessions expire in exactly 60 minutes. Any local storage references are systematically wiped to prevent unattended terminal exploitation.</li>
                <li><strong>Sandbox Integration:</strong> Runs under a dedicated Cloud Run secure sandbox with strict Content Security Policies (CSP) and permission frame policies.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display font-bold text-slate-800 text-lg tracking-tight">3. Third Party Services</h2>
              <p>
                This application interacts with the following services which maintain their own stringent security and privacy regulations:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Google API Services:</strong> Used to access and organize spreadsheet rows. Subject to the Google Privacy Policy.</li>
                <li><strong>Google Gemini (GenAI):</strong> Used as the server-side smart planner to parse tasks, timestamps, and structure checklists seamlessly.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display font-bold text-slate-800 text-lg tracking-tight">4. Your Control and Data Deletion</h2>
              <p>
                Since your checklist database is hosted inside your own Google Drive, you retain full sovereignty over your information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>You can inspect, share, or delete the generated <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">Smart Checklist</code> Google Sheet spreadsheet directly from Google Sheets at any time.</li>
                <li>Logging out or letting the 1-hour session expire will permanently destroy all cached and decrypted tokens from the client browser storage.</li>
              </ul>
            </section>

            <section className="space-y-2 border-t border-slate-100 pt-6">
              <h2 className="font-display font-bold text-slate-800 text-base tracking-tight">Contact Privacy Officer</h2>
              <p className="text-xs text-slate-500">
                For privacy inquires, secure database requests, or technical audits, please contact: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">compliance@smart-ai-checklist.example.com</code> or reach out directly to the administrator workspace dashboard.
              </p>
            </section>
          </div>

          <div className="border-t border-slate-100 pt-6 flex justify-end">
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Acknowledge & Back</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
