import React from 'react';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../types';

interface TaskRowProps {
  key?: string;
  task: Task;
  onUpdateStatus: (taskId: string, nextStatus: 'Pending' | 'Completed') => void;
}

// Helper to format 24h timestamp string to AM/PM format
export const formatTimeWithAmPm = (timeStr: string): string => {
  if (!timeStr) return '';
  if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
    return timeStr;
  }
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    let hh = parseInt(parts[0], 10);
    const mm = parts[1];
    if (isNaN(hh)) return timeStr;
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12;
    if (hh === 0) hh = 12;
    return `${hh}:${mm} ${ampm}`;
  }
  return timeStr;
};

export default function TaskRow({ task, onUpdateStatus }: TaskRowProps) {
  const isCompleted = task.status === 'Completed';

  return (
    <div
      id={`task-row-${task.id}`}
      className={`px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors duration-150 border-b border-slate-100 last:border-none ${
        isCompleted ? 'bg-slate-50/20' : ''
      }`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Visual check indicator */}
        <button
          id={`check-box-btn-${task.id}`}
          type="button"
          onClick={() => onUpdateStatus(task.id, isCompleted ? 'Pending' : 'Completed')}
          className={`mt-0.5 shrink-0 transition-colors cursor-pointer ${
            isCompleted ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'
          }`}
        >
          {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>
        
        {/* Task details */}
        <div className="min-w-0">
          <p
            id={`task-desc-${task.id}`}
            className={`text-sm text-slate-700 leading-normal break-words font-medium ${
              isCompleted ? 'line-through text-slate-400 font-normal' : ''
            }`}
          >
            {task.description}
          </p>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-1 text-[11px] text-slate-400 font-mono font-medium">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {task.date} {formatTimeWithAmPm(task.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive clickable status pills */}
      <button
        id={`status-pill-btn-${task.id}`}
        type="button"
        onClick={() => onUpdateStatus(task.id, isCompleted ? 'Pending' : 'Completed')}
        title={`Click to mark as ${isCompleted ? 'Pending' : 'Completed'}`}
        className={`shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer select-none active:scale-95 ${
          isCompleted
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/70'
            : 'bg-amber-50 text-amber-700 border-amber-150 hover:bg-amber-100/70'
        }`}
      >
        <span>{task.status}</span>
      </button>
    </div>
  );
}
