import React from 'react';
import { Bot, ShieldAlert } from 'lucide-react';
import { User } from 'firebase/auth';
import { Task, ChatMessage } from '../types';
import QuickButtons from './QuickButtons';
import VoiceInput from './VoiceInput';
import TaskTable from './TaskTable';
import WorkspaceHeader from './WorkspaceHeader';
import DatabaseSyncBanner from './DatabaseSyncBanner';
import WorkspaceFooter from './WorkspaceFooter';

interface WorkspaceProps {
  user: User;
  spreadsheetId: string | null;
  tasks: Task[];
  chatMessages: ChatMessage[];
  isAiLoading: boolean;
  isLoadingTasks: boolean;
  isAddingTask: boolean;
  aiError: string | null;
  googleToken: string | null;
  sessionTimeRemaining: number; // in seconds
  userGeminiApiKey: string;
  onSaveGeminiApiKey: (key: string) => void;
  onFetchTasks: () => void;
  onAddTask: (description: string) => void;
  onUpdateStatus: (taskId: string, nextStatus: 'Pending' | 'Completed') => void;
  onSendAiMessage: (queryText: string) => void;
  onLogout: () => void;
  onNavigate: (screen: 'home' | 'privacy' | 'terms') => void;
}

export default function Workspace({
  user,
  spreadsheetId,
  tasks,
  chatMessages,
  isAiLoading,
  isLoadingTasks,
  isAddingTask,
  aiError,
  sessionTimeRemaining,
  userGeminiApiKey,
  onSaveGeminiApiKey,
  onFetchTasks,
  onAddTask,
  onUpdateStatus,
  onSendAiMessage,
  onLogout,
  onNavigate,
}: WorkspaceProps) {
  const isTimeCritical = sessionTimeRemaining < 300; // < 5 minutes remaining

  return (
    <div id="active-workspace-screen" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Workspace Header */}
      <WorkspaceHeader
        user={user}
        sessionTimeRemaining={sessionTimeRemaining}
        onLogout={onLogout}
        onNavigate={onNavigate}
        userGeminiApiKey={userGeminiApiKey}
        onSaveGeminiApiKey={onSaveGeminiApiKey}
      />

      {/* Main Layout Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Secure session critical warning bar if time < 5m */}
        {isTimeCritical && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
            <span>
              Your secure 1-hour login session is about to expire in {Math.ceil(sessionTimeRemaining / 60)} minutes. Please back up any manual tasks; you can re-authenticate easily by logging back in.
            </span>
          </div>
        )}

        {/* Dynamic Connected Database State Header Banner */}
        <DatabaseSyncBanner
          spreadsheetId={spreadsheetId}
          isLoadingTasks={isLoadingTasks}
          onFetchTasks={onFetchTasks}
        />

        {/* Dynamic Bento Dual Column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Direct Sheet manual Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <TaskTable
              tasks={tasks}
              onAddTask={onAddTask}
              onUpdateStatus={onUpdateStatus}
              isAdding={isAddingTask}
              isLoading={isLoadingTasks}
              onRefresh={onFetchTasks}
              spreadsheetId={spreadsheetId}
            />
          </div>

          {/* Right Column: Intelligent AI Workspace Area */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Actions Pills Selector */}
            <div id="quick-pills-bar" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Bot size={15} className="text-blue-500" />
                <h3 className="font-display font-semibold text-slate-800 text-xs uppercase tracking-wider">Quick Action AI Queries</h3>
              </div>
              <QuickButtons
                onSelectQuery={onSendAiMessage}
                disabled={isAiLoading || !spreadsheetId}
              />
            </div>

            {/* AI Voice/Text Interaction Chat Workspace Panel */}
            <VoiceInput
              messages={chatMessages}
              onSendMessage={onSendAiMessage}
              isLoading={isAiLoading}
              errorMsg={aiError}
              userGeminiApiKey={userGeminiApiKey}
              onSaveGeminiApiKey={onSaveGeminiApiKey}
            />
          </div>

        </div>

      </main>

      {/* Workspace Footer */}
      <WorkspaceFooter onNavigate={onNavigate} />

    </div>
  );
}
