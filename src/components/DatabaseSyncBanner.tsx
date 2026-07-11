import React from 'react';
import { FileSpreadsheet, RefreshCw, ArrowRight } from 'lucide-react';

interface DatabaseSyncBannerProps {
  spreadsheetId: string | null;
  isLoadingTasks: boolean;
  onFetchTasks: () => void;
}

export default function DatabaseSyncBanner({
  spreadsheetId,
  isLoadingTasks,
  onFetchTasks,
}: DatabaseSyncBannerProps) {
  if (!spreadsheetId) return null;

  return (
    <div id="workspace-banner" className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
          <FileSpreadsheet size={18} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 text-sm">Task Database Configured</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Your checklist is connected to Google Sheet <strong className="font-medium text-slate-700">"Smart Checklist"</strong>. Any additions or updates will update instantly on Google Drive.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          id="sync-sheet-btn"
          type="button"
          onClick={onFetchTasks}
          disabled={isLoadingTasks}
          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-xs text-slate-600 hover:text-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
        >
          <RefreshCw size={12} className={isLoadingTasks ? 'animate-spin' : ''} />
          <span>Sync Now</span>
        </button>
        <a
          id="open-sheet-link"
          href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition-all shadow-sm shadow-emerald-600/10"
        >
          <span>View Sheet</span>
          <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}
