import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Phone, Mail, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';

export const CustomerFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                <Hotel size={22} />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-tight font-serif">
                  LuxeStay
                </span>
                <span className="text-[10px] tracking-widest text-amber-500 uppercase block">
                  Hotel & Resort
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trải nghiệm nghỉ dưỡng đẳng cấp 5 sao với hệ sinh thái dịch vụ tiện nghi, hiện đại bậc nhất. Chúng tôi cam kết mang đến những kỳ nghỉ hoàn hảo cho bạn và gia đình.
            </p>
          </div>

          {/* Col 2: Liên kết nhanh */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-amber-500 transition-colors">Trang chủ</Link></li>
              <li><Link to="/rooms" className="hover:text-amber-500 transition-colors">Danh sách phòng nghỉ</Link></li>
              <li><Link to="/my-bookings" className="hover:text-amber-500 transition-colors">Lịch sử đặt phòng</Link></li>
              <li><Link to="/receptionist" className="hover:text-amber-500 transition-colors">Cổng Lễ tân (Reception)</Link></li>
              <li><Link to="/admin" className="hover:text-amber-500 transition-colors">Cổng Quản trị viên (Admin)</Link></li>
            </ul>
          </div>

          {/* Col 3: Chính sách & Cam kết */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Cam kết dịch vụ</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Award size={16} className="text-amber-500 shrink-0" />
                <span>Chất lượng phòng tiêu chuẩn quốc tế</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-500 shrink-0" />
                <span>Bảo mật thanh toán & thông tin 100%</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500 shrink-0" />
                <span>Hỗ trợ lễ tân 24/7 nhiệt tình, chu đáo</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Liên hệ */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Thông tin liên hệ</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <span>01 Đường Biển Sơn Trà, TP. Đà Nẵng, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={18} className="text-amber-500 shrink-0" />
                <span>1900 6868 (Hotline 24/7)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={18} className="text-amber-500 shrink-0" />
                <span>booking@luxestay-hotel.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LuxeStay Hotel & Resort. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Điều khoản dịch vụ</span>
            <span className="hover:text-slate-400 cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-slate-400 cursor-pointer">Quy chế hoạt động</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
