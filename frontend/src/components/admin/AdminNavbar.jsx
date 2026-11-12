import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hotel,
  Clock,
  Bell,
  HelpCircle,
  ExternalLink,
  LogOut,
  Menu,
} from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';

export const AdminNavbar = ({ breadcrumbSub = 'Bàn Quản Trị Trung Tâm', onToggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login', { state: { toast: 'Đã đăng xuất' }, replace: true });
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* 1. Left Breadcrumb & Mobile Hamburger */}
      <div className="flex items-center gap-3 text-xs font-medium text-stone-600">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Mở menu quản trị"
            className="lg:hidden p-2 -ml-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex items-center gap-1.5 text-stone-700 font-semibold truncate">
          <Hotel size={15} className="text-stone-500 shrink-0" />
          <span className="hidden sm:inline">L'Étoile Resort & Spa</span>
          <span className="sm:hidden">L'Étoile</span>
        </div>
        <span className="text-stone-300">/</span>
        <span className="text-stone-900 font-semibold truncate">{breadcrumbSub}</span>
      </div>

      {/* 2. Right Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Time pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200/60">
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
          className="hidden sm:flex w-8 h-8 rounded-full hover:bg-stone-100 text-stone-500 items-center justify-center transition-colors cursor-pointer"
        >
          <HelpCircle size={16} />
        </button>
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Đăng xuất quản trị"
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-semibold border border-rose-200/80 transition-colors cursor-pointer shadow-2xs"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
