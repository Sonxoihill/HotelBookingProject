import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';
import { authService } from '../../services/authService';

export const CustomerHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => tokenStorage.getUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(tokenStorage.getToken()));

  // Đồng bộ trạng thái đăng nhập khi có thay đổi trong localStorage hoặc chuyển trang
  useEffect(() => {
    const syncAuth = () => {
      setCurrentUser(tokenStorage.getUser());
      setIsLoggedIn(Boolean(tokenStorage.getToken()));
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    } finally {
      tokenStorage.clearAuth();
      setCurrentUser(null);
      setIsLoggedIn(false);
      window.dispatchEvent(new Event('storage'));
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Danh sách phòng', path: '/rooms' },
    { name: 'Đặt phòng của tôi', path: '/my-bookings' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand: L'ÉTOILE */}
          <Link to="/" className="flex items-center gap-3 group select-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-stone-300 flex items-center justify-center bg-stone-50/80 text-stone-900 group-hover:border-stone-500 transition-colors shadow-2xs">
              {/* Luxury Monogram Crest */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" opacity="0.4" />
                <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-[0.2em] text-stone-900 font-serif uppercase leading-tight">
                L'ÉTOILE
              </span>
              <span className="text-[9px] tracking-[0.25em] text-stone-500 uppercase -mt-0.5">
                Resorts & Hotels
              </span>
            </div>
          </Link>

          {/* Center Navigation: Luxury Pill Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 lg:px-5 py-1.5 rounded-full transition-all duration-200 font-medium ${isActive
                      ? 'bg-[#F7DFBC] text-[#2C1E11] font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Khi đã đăng nhập thì có Nút hồ sơ cá nhân và Nút đăng xuất; khi đăng xuất thì chuyển thành Nút đăng nhập */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <>
                {/* Nút hồ sơ cá nhân với avatar chữ cái đầu */}
                <Link
                  to="/profile"
                  title={currentUser?.fullName ? `Hồ sơ cá nhân: ${currentUser.fullName}` : 'Hồ sơ cá nhân'}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-xs font-semibold text-stone-800"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.fullName}</span>
                </Link>

                {/* Nút đăng xuất */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Đăng xuất khỏi hệ thống"
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold text-stone-700 hover:text-rose-600 bg-stone-100 hover:bg-rose-50 border border-stone-300 hover:border-rose-200 transition-all cursor-pointer shadow-2xs group"
                >
                  <LogOut size={15} className="text-stone-500 group-hover:text-rose-600 transition-colors" />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              /* Nút đăng nhập + đăng ký khi chưa đăng nhập */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
                >
                  Đăng Ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl md:hidden ml-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-2 animate-in fade-in duration-150 shadow-lg">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm px-4 py-2.5 rounded-xl transition-colors ${isActive
                    ? 'bg-[#F7DFBC] text-[#2C1E11] font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-stone-100 mt-2">
            {currentUser ? (
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-sm px-4 py-2.5 rounded-xl text-stone-700 hover:bg-stone-50 font-medium"
                >
                  <User size={16} />
                  <span>Hồ sơ cá nhân ({currentUser?.fullName || 'Khách hàng'})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 text-sm px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-left cursor-pointer font-medium"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm py-2 px-3 border border-stone-300 rounded-xl font-medium text-stone-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-sm py-2 px-3 bg-amber-600 text-white rounded-xl font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default CustomerHeader;
