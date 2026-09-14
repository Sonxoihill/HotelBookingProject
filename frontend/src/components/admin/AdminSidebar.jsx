import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  DoorOpen,
  ConciergeBell,
  BadgePercent,
  Users,
  Hotel,
  ExternalLink,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Báo cáo & Thống kê',
      path: '/admin',
      icon: BarChart3,
      exact: true,
    },
    {
      name: 'Loại phòng & Phòng',
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
      name: 'Quản lý Nhân sự',
      path: '/admin/staff',
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Hotel size={22} />
          </div>
          <div>
            <span className="text-base font-bold text-white block leading-tight font-serif">
              LuxeStay
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.5 rounded">
              Admin Portal
            </span>
          </div>
        </div>
      </div>

      {/* Admin Profile */}
      <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Quyền quản trị</span>
          <ShieldAlert size={14} className="text-amber-400" />
        </div>
        <p className="font-semibold text-white truncate">{user?.fullName || 'Tổng Quản Lý'}</p>
        <span className="text-[10px] text-amber-400">Toàn quyền hệ thống</span>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-2 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
          Quản trị chiến lược
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Quick Portal Switch & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => navigate('/receptionist')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 transition-colors cursor-pointer"
        >
          <ExternalLink size={16} />
          <span>Chuyển sang Quầy Lễ Tân</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <ExternalLink size={16} />
          <span>Xem Trang Khách hàng</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Đăng xuất Admin</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
