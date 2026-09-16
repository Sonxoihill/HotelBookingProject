import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  DoorOpen,
  ConciergeBell,
  BadgePercent,
  Users,
  Settings,
  Server,
} from 'lucide-react';

export const AdminSidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Tổng quan & Thống kê',
      path: '/admin',
      icon: BarChart3,
      exact: true,
    },
    {
      name: 'Phòng & Loại phòng',
      path: '/admin/rooms',
      icon: DoorOpen,
    },
    {
      name: 'Quản lý Dịch vụ',
      path: '/admin/services',
      icon: ConciergeBell,
    },
    {
      name: 'Cài đặt Giá linh hoạt',
      path: '/admin/pricing',
      icon: BadgePercent,
    },
    {
      name: 'Nhân sự & Phân quyền',
      path: '/admin/staff',
      icon: Users,
    },
    {
      name: 'Cài đặt Hệ thống',
      path: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-white text-stone-700 flex flex-col shrink-0 min-h-screen border-r border-stone-200/90 shadow-2xs select-none">
      {/* 1. Brand Header */}
      <div className="p-5 border-b border-stone-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0E1524] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
          É
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg font-bold tracking-tight text-stone-900 leading-tight">
            L'Étoile
          </span>
          <span className="text-[9px] tracking-[0.22em] text-stone-400 uppercase font-semibold">
            HOSPITALITY PMS
          </span>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 p-3.5 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1.5">
          QUẢN TRỊ HỆ THỐNG
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
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
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              alt="Lê Hoàng Phúc"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200 shadow-2xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-900 truncate">
                  Lê Hoàng Phúc
                </span>
              </div>
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 leading-none mt-0.5">
                QUẢN TRỊ VIÊN
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px] text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Máy chủ: Đang kết nối
            </span>
            <Server size={13} className="text-stone-400" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
