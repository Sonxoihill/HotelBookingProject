import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Briefcase,
  Coins,
  Sparkles,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';

export const ReceptionistSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Sơ đồ phòng (Rack)',
      path: '/receptionist',
      icon: LayoutGrid,
    },
    {
      name: 'Đơn đặt phòng',
      path: '/receptionist/bookings',
      icon: Briefcase,
    },
    {
      name: 'Dịch vụ & Minibar',
      path: '/receptionist/services',
      icon: Coins,
    },
    {
      name: 'Buồng phòng',
      path: '/receptionist/housekeeping',
      icon: Sparkles,
    },
  ];

  return (
    <aside className="w-64 bg-white text-stone-700 flex flex-col shrink-0 min-h-screen border-r border-stone-200/90 shadow-2xs select-none">
      {/* 1. Brand Header */}
      <div className="p-5 border-b border-stone-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
          É
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg font-bold tracking-tight text-stone-900 leading-tight">
            L'Étoile
          </span>
          <span className="text-[9px] tracking-[0.25em] text-stone-400 uppercase font-semibold">
            HOSPITALITY PMS
          </span>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 p-3.5 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/receptionist'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#101726] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* 3. Receptionist User Profile Footer */}
      <div className="p-4 border-t border-stone-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center border border-stone-300">
            HT
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-stone-900 truncate">
              Mai Huyền Trâm
            </h4>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Ca sáng (06:00 - 14:00)</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => navigate('/')}
            title="Xem giao diện khách hàng"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-[11px] font-medium text-stone-600 border border-stone-200 transition-colors cursor-pointer"
          >
            <ExternalLink size={12} />
            <span>Trang khách</span>
          </button>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-1.5 rounded-lg bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ReceptionistSidebar;
