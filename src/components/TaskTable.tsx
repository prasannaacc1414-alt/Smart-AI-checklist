import React, { useState } from 'react';
import { AlertCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Task } from '../types';
import QuickAddTask from './QuickAddTask';
import TaskFilters, { TaskFilterType } from './TaskFilters';
import TaskRow from './TaskRow';

interface TaskTableProps {
  tasks: Task[];
  onAddTask: (description: string) => void;
  onUpdateStatus: (taskId: string, nextStatus: 'Pending' | 'Completed') => void;
  isAdding: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  spreadsheetId: string | null;
}

export default function TaskTable({
  tasks,
  onAddTask,
  onUpdateStatus,
  isAdding,
  isLoading,
  spreadsheetId,
}: TaskTableProps) {
  const [filter, setFilter] = useState<TaskFilterType>('Pending today');
  const [search, setSearch] = useState('');

  // Determine current local today string in YYYY-MM-DD
  const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Filter lists based on search query
  const filterBySearch = (list: Task[]) => {
    if (!search.trim()) return list;
    const query = search.toLowerCase();
    return list.filter((t) => t.description.toLowerCase().includes(query));
  };

  // Prepare task groups for each of the four tabs
  const allTasks = filterBySearch(
    [...tasks].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.timestamp.localeCompare(a.timestamp);
    })
  );

  const completedTodayTasks = filterBySearch(
    tasks
      .filter((t) => t.status === 'Completed' && t.date === todayStr)
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.timestamp.localeCompare(a.timestamp);
      })
  );

  const pendingTodayTasks = filterBySearch(
    tasks
      .filter((t) => t.status !== 'Completed' && t.date === todayStr)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.timestamp.localeCompare(b.timestamp);
      })
  );

  const pendingNextTasks = filterBySearch(
    tasks
      .filter((t) => t.status !== 'Completed' && t.date > todayStr)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.timestamp.localeCompare(b.timestamp);
      })
  );

  return (
    <div id="manual-checklist-workspace" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full min-h-[520px]">
      
      {/* Quick Add Form Component */}
      <QuickAddTask 
        onAddTask={onAddTask} 
        isAdding={isAdding} 
        isLoading={isLoading} 
      />

      {/* Task Filters and Keyword Search Component */}
      <TaskFilters 
        filter={filter} 
        setFilter={setFilter} 
        search={search} 
        setSearch={setSearch} 
      />

      {/* Task Table lists */}
      <div id="tasks-table-scroll-wrapper" className="flex-1 overflow-y-auto min-h-[300px]">
        {isLoading ? (
          <div id="table-loading-spinner" className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 gap-2 p-6">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
            <span className="text-xs font-medium text-slate-500 font-mono">Syncing database values...</span>
          </div>
        ) : (() => {
          if (filter === 'All') {
            if (allTasks.length === 0) {
              return (
                <div id="table-empty-state-all" className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                  <AlertCircle size={24} className="text-slate-300 mb-2" />
                  <h4 className="font-semibold text-slate-600 text-sm mb-1">No checklist tasks found</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {search ? "No tasks match your search query." : "Your checklist is currently empty."}
                  </p>
                </div>
              );
            }
            return (
              <div id="tasks-checklist-list-all" className="divide-y divide-slate-100">
                {allTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onUpdateStatus={onUpdateStatus} />
                ))}
              </div>
            );
          }

          if (filter === 'Completed today') {
            if (completedTodayTasks.length === 0) {
              return (
                <div id="table-empty-state-completed-today" className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                  <AlertCircle size={24} className="text-slate-300 mb-2" />
                  <h4 className="font-semibold text-slate-600 text-sm mb-1">No completed tasks today</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {search ? "No completed tasks match your search query." : "You haven't completed any tasks today."}
                  </p>
                </div>
              );
            }
            return (
              <div id="tasks-checklist-list-completed-today" className="divide-y divide-slate-100">
                {completedTodayTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onUpdateStatus={onUpdateStatus} />
                ))}
              </div>
            );
          }

          if (filter === 'Pending today') {
            if (pendingTodayTasks.length === 0) {
              return (
                <div id="table-empty-state-pending-today" className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                  <AlertCircle size={24} className="text-slate-300 mb-2" />
                  <h4 className="font-semibold text-slate-600 text-sm mb-1">No pending tasks today</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {search ? "No pending tasks match your search query." : "All caught up! You have no pending tasks scheduled for today."}
                  </p>
                </div>
              );
            }
            return (
              <div id="tasks-checklist-list-pending-today" className="divide-y divide-slate-100">
                {pendingTodayTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onUpdateStatus={onUpdateStatus} />
                ))}
              </div>
            );
          }

          if (filter === 'Pending next') {
            if (pendingNextTasks.length === 0) {
              return (
                <div id="table-empty-state-pending-next" className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                  <AlertCircle size={24} className="text-slate-300 mb-2" />
                  <h4 className="font-semibold text-slate-600 text-sm mb-1">No upcoming pending tasks</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {search ? "No upcoming pending tasks match your search query." : "No pending tasks scheduled for tomorrow or onwards."}
                  </p>
                </div>
              );
            }
            return (
              <div id="tasks-checklist-list-pending-next" className="divide-y divide-slate-100">
                {pendingNextTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onUpdateStatus={onUpdateStatus} />
                ))}
              </div>
            );
          }

          return null;
        })()}
      </div>

      {/* Spreadsheet Status Footer */}
      {spreadsheetId && (
        <div id="spreadsheet-sync-footer" className="px-5 py-3 border-t border-slate-150/60 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <FileSpreadsheet size={13} className="text-emerald-600 shrink-0" />
            <span className="truncate max-w-[280px]">Database ID: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600 text-[10px]">{spreadsheetId}</code></span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Changes sync automatically with Google Sheets</span>
        </div>
      )}
    </div>
  );
}
