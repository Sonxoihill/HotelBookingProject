import React from 'react';
import { Bell, Search, Clock, Calendar } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const ReceptionistNavbar = ({ title = 'Sơ đồ phòng khách sạn' }) => {
  const now = new Date();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
          <Clock size={12} className="text-slate-400" />
          <span>Hôm nay: {formatDateTime(now)}</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Room Search */}
        <div className="relative w-64 hidden sm:block">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm nhanh số phòng / khách..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default ReceptionistNavbar;
