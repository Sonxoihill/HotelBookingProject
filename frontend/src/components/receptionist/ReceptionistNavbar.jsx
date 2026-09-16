import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

export const ReceptionistNavbar = () => {
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    if (location.pathname.includes('/bookings')) return 'QUẢN LÝ NHẬN PHÒNG';
    if (location.pathname.includes('/services')) return 'DỊCH VỤ & MINIBAR';
    if (location.pathname.includes('/housekeeping')) return 'QUẢN LÝ BUỒNG PHÒNG';
    return 'SƠ ĐỒ PHÒNG (RACK)';
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200/90 px-6 sm:px-8 flex items-center justify-between shrink-0 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
        <span className="text-stone-400">FRONT DESK</span>
        <span className="text-stone-300">/</span>
        <span className="text-stone-800">{getBreadcrumbTitle()}</span>
      </div>

      {/* Right Controls & Status */}
      <div className="flex items-center gap-4 text-xs">
        {/* PMS Online status pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống PMS trực tuyến</span>
        </div>

        {/* Terminal ID */}
        <span className="text-stone-500 font-mono text-[11px] hidden sm:inline-block">
          Terminal: FO-01
        </span>

        {/* Notification Bell */}
        <button
          type="button"
          title="Thông báo hệ thống"
          className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-600 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default ReceptionistNavbar;
