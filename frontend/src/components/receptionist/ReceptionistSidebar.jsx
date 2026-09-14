import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, CalendarRange, Hotel, ExternalLink, LogOut, Sparkles } from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';

export const ReceptionistSidebar = () => {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Sơ đồ phòng',
      path: '/receptionist',
      icon: LayoutGrid,
      badge: 'Live',
    },
    {
      name: 'Đơn đặt phòng',
      path: '/receptionist/bookings',
      icon: CalendarRange,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Hotel size={22} />
          </div>
          <div>
            <span className="text-base font-bold text-white block leading-tight font-serif">
              LuxeStay
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
              Quầy Lễ Tân
            </span>
          </div>
        </div>
      </div>

      {/* Receptionist Shift Info */}
      <div className="mx-4 my-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Nhân viên trực</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="font-semibold text-white truncate">{user?.fullName || 'Lễ tân ca 1'}</p>
        <span className="text-[10px] text-cyan-400">Ca sáng (06:00 - 14:00)</span>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-2 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
          Nghiệp vụ quầy
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/receptionist'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Switch link */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
        >
          <ExternalLink size={16} />
          <span>Xem Trang Khách hàng</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Đăng xuất ca</span>
        </button>
      </div>
    </aside>
  );
};

export default ReceptionistSidebar;
