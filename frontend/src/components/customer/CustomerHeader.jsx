import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const CustomerHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Right: User Profile Avatar */}
          <div className="flex items-center gap-3">
            <Link
              to="/my-bookings"
              title="Tài khoản cá nhân"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-stone-300 hover:border-stone-500 transition-transform hover:scale-105 shadow-xs flex items-center justify-center bg-stone-100"
            >
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl md:hidden"
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
        </div>
      )}
    </header>
  );
};

export default CustomerHeader;
