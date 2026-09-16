import React from 'react';
import { Link } from 'react-router-dom';

export const CustomerFooter = () => {
  return (
    <footer className="bg-[#0D1424] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14 text-xs sm:text-sm">
          {/* Column 1: Brand & Intro */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-[0.25em] text-white font-serif uppercase">
                L'ÉTOILE
              </span>
              <span className="text-[10px] tracking-[0.25em] text-stone-400 uppercase -mt-0.5">
                Resorts & Hotels
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              Kỹ nghệ khách sạn và khu nghỉ dưỡng boutique sang trọng bậc nhất mang đến trải nghiệm vương giả cho những vị khách tinh tế.
            </p>
          </div>

          {/* Column 2: Khám phá */}
          <div className="space-y-3.5">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Khám phá</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link to="/rooms" className="hover:text-stone-200 transition-colors">
                  Bộ sưu tập phòng
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="hover:text-stone-200 transition-colors">
                  Ẩm thực Michelin
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="hover:text-stone-200 transition-colors">
                  Thermal & Spa
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-stone-200 transition-colors">
                  Đặc quyền Hội viên
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Chính sách */}
          <div className="space-y-3.5">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Chính sách</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><span className="hover:text-stone-200 cursor-pointer transition-colors">Chính sách bảo mật</span></li>
              <li><span className="hover:text-stone-200 cursor-pointer transition-colors">Điều khoản đặt phòng</span></li>
              <li><span className="hover:text-stone-200 cursor-pointer transition-colors">Quy định chung</span></li>
              <li><span className="hover:text-stone-200 cursor-pointer transition-colors">Chính sách hoàn hủy</span></li>
            </ul>
          </div>

          {/* Column 4: Liên hệ */}
          <div className="space-y-3.5">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Liên hệ</h4>
            <div className="space-y-2 text-xs text-stone-400 leading-relaxed">
              <p>Bãi Dài, Cam Ranh & Phú Quốc, Việt Nam</p>
              <p>Hotline: +84 (0) 28 3912 8888</p>
              <p>Email: concierge@letoilehotels.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <p>© 2024 L'Étoile Hotels & Resorts. All rights reserved.</p>
          <div className="flex items-center gap-6 text-stone-400 text-xs">
            <span className="hover:text-stone-200 cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-stone-200 cursor-pointer transition-colors">LinkedIn</span>
            <span className="hover:text-stone-200 cursor-pointer transition-colors">Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
