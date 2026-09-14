import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hotel, User, LogIn, UserPlus, Calendar, LogOut, Menu, X } from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';
import Button from '../common/Button';

export const CustomerHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = tokenStorage.getUser();
  const token = tokenStorage.getToken();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    tokenStorage.clearAuth();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Phòng nghỉ', path: '/rooms' },
    { name: 'Lịch sử đặt phòng', path: '/my-bookings', requireAuth: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Hotel size={24} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight font-serif">
                LuxeStay
              </span>
              <span className="text-[11px] font-medium tracking-widest text-amber-600 uppercase block">
                Hotel & Resort
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.requireAuth && !token) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-amber-600 border-b-2 border-amber-600 py-1'
                      : 'text-slate-600 hover:text-amber-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Buttons / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {token && user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.fullName || user.email || 'Khách hàng'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <LogIn size={16} />
                    <span>Đăng nhập</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <UserPlus size={16} />
                    <span>Đăng ký</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => {
            if (link.requireAuth && !token) return null;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 py-2 hover:text-amber-600"
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {token ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-700 py-1"
                >
                  Hồ sơ cá nhân
                </Link>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Đăng ký tài khoản
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default CustomerHeader;
