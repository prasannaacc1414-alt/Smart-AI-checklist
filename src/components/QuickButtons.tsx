import React from 'react';
import { Calendar, Clock, CheckSquare } from 'lucide-react';

interface QuickButtonsProps {
  onSelectQuery: (query: string) => void;
  disabled: boolean;
}

export default function QuickButtons({ onSelectQuery, disabled }: QuickButtonsProps) {
  const actions = [
    {
      label: "Today's Pending Tasks",
      query: "List all of my pending tasks for today. Group them nicely.",
      icon: Calendar,
      color: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
    },
    {
      label: "Tomorrow's Agenda",
      query: "Show me my scheduled tasks and agenda for tomorrow. Highlight what needs attention.",
      icon: Clock,
      color: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
    },
    {
      label: "What did I complete yesterday?",
      query: "Give me a summary of all the tasks I marked as Completed yesterday.",
      icon: CheckSquare,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
    }
  ];

  return (
    <div id="quick-action-pills-container" className="flex flex-wrap gap-2.5">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.label}
            id={`pill-btn-${act.label.toLowerCase().replace(/\s+/g, '-')}`}
            type="button"
            onClick={() => onSelectQuery(act.query)}
            disabled={disabled}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${act.color}`}
          >
            <Icon size={15} />
            <span>{act.label}</span>
          </button>
        );
      })}
    </div>
  );
}
