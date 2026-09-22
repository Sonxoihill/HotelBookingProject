import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LogIn, User } from 'lucide-react';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../utils/tokenStorage';

export const CustomerHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => tokenStorage.getUser());
  const [token, setToken] = useState(() => tokenStorage.getToken());

  useEffect(() => {
    const syncAuth = () => {
      setCurrentUser(tokenStorage.getUser());
      setToken(tokenStorage.getToken());
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, [location.pathname]);

  const isLoggedIn = Boolean(token || currentUser);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Lỗi khi đăng xuất:', err);
      tokenStorage.clearAuth();
    } finally {
      setCurrentUser(null);
      setToken(null);
      setMobileMenuOpen(false);
      navigate('/login', { replace: true });
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'KH';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/api\/v1\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Danh sách phòng', path: '/rooms' },
    { name: 'Trải nghiệm dịch vụ', path: '/experiences' },
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
                  className={`px-4 lg:px-5 py-1.5 rounded-full transition-all duration-200 font-medium ${
                    isActive
                      ? 'bg-[#F7DFBC] text-[#2C1E11] font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Auth Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <>
                {/* User Profile Link */}
                <Link
                  to="/profile"
                  title={`Hồ sơ cá nhân: ${currentUser?.fullName || 'Khách hàng'}`}
                  className="flex items-center gap-2 py-1 px-1.5 sm:px-2 rounded-full hover:bg-stone-100/80 transition-colors group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-stone-300 group-hover:border-stone-500 shadow-2xs flex items-center justify-center bg-[#F7DFBC] text-[#2C1E11] font-semibold text-xs shrink-0 select-none">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={getAvatarUrl(currentUser.avatarUrl)}
                        alt={currentUser?.fullName || 'Avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : currentUser?.fullName ? (
                      getUserInitials(currentUser.fullName)
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  {currentUser?.fullName && (
                    <div className="hidden lg:flex flex-col text-left leading-tight">
                      <span className="text-xs font-semibold text-stone-800 truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {currentUser.role === 'ADMIN'
                          ? 'Quản trị'
                          : currentUser.role === 'RECEPTIONIST'
                          ? 'Lễ tân'
                          : 'Khách hàng'}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Logout Button in Header Right Corner */}
                <button
                  onClick={handleLogout}
                  title="Đăng xuất khỏi hệ thống"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-full transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                >
                  <LogOut size={14} className="stroke-[2.2]" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#2C1E11] bg-[#F7DFBC] hover:bg-[#ebd0a7] border border-[#ecd2ae] rounded-full transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-95"
              >
                <LogIn size={15} />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl md:hidden cursor-pointer"
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
                className={`block text-sm px-4 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[#F7DFBC] text-[#2C1E11] font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <div className="pt-3 border-t border-stone-200 space-y-1">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm px-4 py-2.5 rounded-xl font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <User size={16} className="text-stone-500" />
                <span>Hồ sơ cá nhân ({currentUser?.fullName || 'Khách hàng'})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 text-sm px-4 py-2.5 rounded-xl font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-stone-200 space-y-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl font-semibold bg-[#F7DFBC] text-[#2C1E11] hover:bg-[#ebd0a7] transition-colors"
              >
                <LogIn size={16} />
                <span>Đăng nhập</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default CustomerHeader;
