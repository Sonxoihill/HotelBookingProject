import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Hotel,
  Clock,
  Bell,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const AdminNavbar = ({ breadcrumbSub = 'Bàn Quản Trị Trung Tâm' }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* 1. Left Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
        <div className="flex items-center gap-1.5 text-stone-700 font-semibold">
          <Hotel size={15} className="text-stone-500" />
          <span>L'Étoile Resort & Spa</span>
        </div>
        <span className="text-stone-300">/</span>
        <span className="text-stone-900 font-semibold">{breadcrumbSub}</span>
      </div>

      {/* 2. Right Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Time pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200/60">
          <Clock size={13} className="text-stone-500" />
          <span>Hôm nay • GMT+7</span>
        </div>

        {/* Notifications */}
        <button
          title="Thông báo hệ thống"
          className="relative w-8 h-8 rounded-full hover:bg-stone-100 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* Help */}
        <button
          title="Trợ giúp & Tài liệu PMS"
          className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <HelpCircle size={16} />
        </button>

        {/* Switch to Receptionist PMS */}
        <button
          onClick={() => navigate('/receptionist')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E1524] hover:bg-stone-800 text-white text-xs font-semibold tracking-wide shadow-xs transition-colors cursor-pointer ml-1"
        >
          <ExternalLink size={13} />
          <span>LỄ TÂN PMS</span>
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
