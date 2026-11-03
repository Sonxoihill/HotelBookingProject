import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Layers,
  DoorOpen,
  ConciergeBell,
  BadgePercent,
  Users,
  Server,
  LogOut,
  X,
} from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';

export const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const currentUser = tokenStorage.getUser();
  const userRole = tokenStorage.getUserRole();
  const fullName = currentUser?.fullName || currentUser?.name || 'Quản trị viên';
  const email = currentUser?.email || '';
  const initial = (fullName.trim()[0] || 'A').toUpperCase();
  const roleLabel =
    userRole === 'ADMIN'
      ? 'QUẢN TRỊ VIÊN'
      : userRole === 'RECEPTIONIST'
      ? 'LỄ TÂN'
      : (userRole || 'QUẢN TRỊ VIÊN');

  const handleLogout = () => {
    tokenStorage.clearAuth();
    if (onClose) onClose();
    navigate('/login', { state: { toast: 'Đã đăng xuất' }, replace: true });
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: BarChart3,
    },
    {
      name: 'Loại phòng',
      path: '/admin/room-categories',
      icon: Layers,
    },
    {
      name: 'Quản lý Phòng',
      path: '/admin/rooms',
      icon: DoorOpen,
    },
    {
      name: 'Dịch vụ',
      path: '/admin/services',
      icon: ConciergeBell,
    },
    {
      name: 'Giá linh hoạt',
      path: '/admin/pricing',
      icon: BadgePercent,
    },
    {
      name: 'Người dùng',
      path: '/admin/users',
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 bg-white text-stone-700 flex flex-col shrink-0 min-h-screen border-r border-stone-200/90 shadow-2xs select-none">
      {/* 1. Brand Header */}
      <div className="p-5 border-b border-stone-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            navigate('/admin/dashboard');
          }}
          className="flex items-center gap-3 text-left cursor-pointer group focus:outline-none transition-opacity hover:opacity-85"
          title="Quay về Dashboard Quản trị"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0E1524] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs group-hover:bg-stone-800 transition-colors">
            É
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-stone-900 leading-tight group-hover:text-amber-800 transition-colors">
              L'Étoile
            </span>
            <span className="text-[9px] tracking-[0.22em] text-stone-400 uppercase font-semibold">
              HOSPITALITY PMS
            </span>
          </div>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Đóng menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1.5">
          QUẢN TRỊ HỆ THỐNG
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0E1524] text-white shadow-xs font-medium'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* 3. Bottom Admin Profile Card */}
      <div className="p-3.5 border-t border-stone-100">
        <div className="bg-[#F8F9FA] border border-stone-200/80 rounded-2xl p-3 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={fullName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0E1524] text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-xs font-bold text-stone-900 truncate"
                  title={email ? `${fullName} (${email})` : fullName}
                >
                  {fullName}
                </span>
              </div>
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 leading-none mt-0.5">
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Máy chủ: Đang kết nối
            </span>
            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất nhanh"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-200/80 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut size={12} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
