import React from 'react';
import { Bell, ShieldCheck, User } from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';

export const AdminNavbar = ({ title = 'Quản trị hệ thống khách sạn' }) => {
  const user = tokenStorage.getUser();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500">Khu vực quản lý chiến lược & thiết lập hệ sinh thái</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-800 leading-none">{user?.fullName || 'Administrator'}</p>
            <span className="text-[10px] text-amber-600 font-semibold">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
