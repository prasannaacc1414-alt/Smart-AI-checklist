import React from 'react';
import { Search } from 'lucide-react';

export type TaskFilterType = 'Pending today' | 'Completed today' | 'Pending next' | 'All';

interface TaskFiltersProps {
  filter: TaskFilterType;
  setFilter: (filter: TaskFilterType) => void;
  search: string;
  setSearch: (search: string) => void;
}

export default function TaskFilters({
  filter,
  setFilter,
  search,
  setSearch,
}: TaskFiltersProps) {
  const filterOptions: TaskFilterType[] = ['Pending today', 'Completed today', 'Pending next', 'All'];

  return (
    <div id="filter-search-tray" className="p-4 px-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
      
      {/* Status Filters */}
      <div id="status-filter-buttons" className="flex flex-wrap bg-slate-100/80 p-0.5 rounded-lg w-full sm:w-auto gap-0.5 sm:gap-0">
        {filterOptions.map((st) => (
          <button
            key={st}
            id={`filter-btn-${st.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setFilter(st)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
              filter === st
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Text Keyword Search */}
      <div className="relative w-full sm:w-60">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="checklist-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-slate-50 border border-slate-150 pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
