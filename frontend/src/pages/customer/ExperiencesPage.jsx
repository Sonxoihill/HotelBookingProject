import React, { useState } from 'react';
import { ConciergeBell, Car, Utensils, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const ExperiencesPage = () => {
  const [serviceType, setServiceType] = useState('Trị liệu Spa cao cấp');
  const [serviceDate, setServiceDate] = useState('2024-11-15');
  const [serviceTime, setServiceTime] = useState('Buổi sáng (09:00 - 12:00)');
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const handleBooking = (e) => {
    e.preventDefault();
    setBookedSuccess(true);
    setTimeout(() => setBookedSuccess(false), 4000);
  };

  const exclusiveServices = [
    {
      id: 1,
      title: 'Quản gia riêng 24/7',
      desc: 'Đội ngũ quản gia đạt chuẩn hoàng gia Anh, luôn sẵn sàng phục vụ mọi nhu cầu cá nhân hóa bất kể ngày đêm.',
      icon: ConciergeBell,
    },
    {
      id: 2,
      title: 'Đưa đón Maybach',
      desc: 'Trải nghiệm di chuyển đẳng cấp với dòng xe siêu sang Mercedes-Maybach cùng tài xế riêng chuyên nghiệp.',
      icon: Car,
    },
    {
      id: 3,
      title: 'Ẩm thực Sao Michelin',
      desc: 'Thưởng thức các thực đơn haute cuisine độc bản do bếp trưởng danh tiếng trực tiếp chế biến và phục vụ tại phòng.',
      icon: Utensils,
    },
    {
      id: 4,
      title: 'Trị liệu Spa thiên nhiên',
      desc: 'Liệu pháp phục hồi năng lượng độc quyền kết hợp thảo mộc quý hiếm và kỹ thuật massage truyền thống Á Đông.',
      icon: Sparkles,
    },
  ];

  const itineraryDays = [
    {
      day: 'Ngày 01',
      title: 'Đón tiếp & Thư giãn',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      timeline: [
        { time: '14:00', text: 'Xe Maybach đón tại sân bay, thưởng thức trà chiều thượng hạng tại Penthouse Suite.' },
        { time: '16:30', text: "Trải nghiệm liệu trình thư giãn 90 phút tại L'Étoile Spa bên bờ biển." },
        { time: '19:30', text: 'Bữa tối lãng mạn dưới ánh nến với thực đơn 7 món từ Bếp trưởng Michelin.' },
      ],
    },
    {
      day: 'Ngày 02',
      title: 'Khám phá & Trải nghiệm',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      timeline: [
        { time: '08:30', text: 'Thưởng thức bữa sáng phục vụ riêng tại ban công ngắm vịnh biển.' },
        { time: '10:30', text: 'Hải trình khám phá vịnh bằng du thuyền riêng, thưởng thức canapé & vang trắng.' },
        { time: '18:00', text: 'Tiệc cocktail hoàng hôn tại Sky Bar tầng thượng cao nhất resort.' },
      ],
    },
    {
      day: 'Ngày 03',
      title: 'Tận hưởng & Trở về',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      timeline: [
        { time: '07:30', text: 'Lớp Yoga bình minh đặc quyền cùng chuyên gia quốc tế tại khuôn viên vườn zen.' },
        { time: '10:00', text: 'Thư giãn tự do tại hồ bơi vô cực nước mặn ở tầng cao.' },
        { time: '12:00', text: 'Làm thủ tục trả phòng và xe Maybach tiễn đoàn ra sân bay.' },
      ],
    },
  ];

  const galleryImages = [
    {
      category: 'Kiến trúc',
      title: 'Sảnh đón tiếp hoàng gia',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    },
    {
      category: 'Ẩm thực',
      title: 'Nhà hàng Etoile',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    },
    {
      category: 'Tiện ích',
      title: 'Hồ bơi vô cực panorama',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="space-y-20 pb-20 bg-[#FAF8F5]">
      {/* 1. Hero Section */}
      <section className="relative min-h-[480px] sm:min-h-[540px] flex items-center justify-center bg-stone-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-900/50 to-[#FAF8F5]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-4 pt-16 pb-20 z-10">
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-[#F7DFBC] uppercase block">
            Trải nghiệm & Tiện ích 5 sao
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-white font-serif tracking-tight leading-tight">
            Nghệ thuật sống đỉnh cao tại <br />
            <span className="font-serif italic font-medium">L'Étoile</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 max-w-xl mx-auto font-light leading-relaxed">
            Mỗi khoảnh khắc tại L'Étoile Hotels & Resorts là một tuyệt tác được kiến tạo riêng biệt cho vị thế độc tôn của Quý khách.
          </p>
        </div>
      </section>

      {/* 2. Dịch vụ độc quyền 24/7 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-stone-500 uppercase block mb-1">
              Đặc quyền thượng lưu
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
              Dịch vụ độc quyền 24/7
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md font-light leading-relaxed">
            Sự tỉ mỉ trong từng chi tiết nhỏ nhất mang đến trải nghiệm thăng hoa, vượt mọi kỳ vọng của những vị khách tinh tế nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {exclusiveServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#FBF4EA] border border-[#F7E1BC] text-[#C59D5F] flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-[#B89355] transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    {srv.desc}
                  </p>
                </div>
                <div className="pt-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 group-hover:text-[#B89355] transition-colors cursor-pointer">
                    Khám phá đặc quyền <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Gợi ý hành trình - Kỳ nghỉ 3 ngày 2 đêm hoàn hảo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-stone-500 uppercase block">
            Gợi ý hành trình
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
            Kỳ nghỉ 3 ngày 2 đêm hoàn hảo
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Lịch trình được thiết kế tối ưu hóa sự thư giãn, khám phá và tận hưởng trọn vẹn mọi tiện ích đỉnh cao.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {itineraryDays.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col"
            >
              {/* Header Pill */}
              <div className="p-4 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
                <span className="px-3 py-1 rounded-full bg-[#F7DFBC] text-[#2C1E11] text-xs font-bold font-mono">
                  {item.day}
                </span>
                <span className="text-xs font-medium text-stone-700">
                  {item.title}
                </span>
              </div>

              {/* Photo */}
              <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Schedule */}
              <div className="p-5 space-y-4 flex-1">
                {item.timeline.map((slot, sIdx) => (
                  <div key={sIdx} className="flex gap-3 items-start text-xs">
                    <span className="font-bold text-stone-900 font-mono shrink-0 w-11 mt-0.5">
                      {slot.time}
                    </span>
                    <p className="text-stone-600 font-light leading-relaxed">
                      {slot.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Đặt lịch dịch vụ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.25em] text-stone-500 uppercase block">
              Đặt lịch dịch vụ
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
              Lên kế hoạch cho trải nghiệm của bạn
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-light">
              Quý khách vui lòng chọn dịch vụ mong muốn để đội ngũ quản gia chuẩn bị chu đáo nhất.
            </p>
          </div>

          {bookedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-medium animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>
                Yêu cầu đặt lịch dịch vụ thành công! Đội ngũ Quản gia L'Étoile sẽ liên hệ xác nhận trong ít phút.
              </span>
            </div>
          )}

          <form onSubmit={handleBooking} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end pt-2">
            {/* Loại dịch vụ */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700">Loại dịch vụ</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
              >
                <option value="Trị liệu Spa cao cấp">Trị liệu Spa cao cấp</option>
                <option value="Đưa đón Maybach">Đưa đón Maybach</option>
                <option value="Ẩm thực Sao Michelin">Ẩm thực Sao Michelin</option>
                <option value="Du thuyền riêng">Hải trình Du thuyền riêng</option>
              </select>
            </div>

            {/* Ngày thực hiện */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700">Ngày thực hiện</label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
              />
            </div>

            {/* Khung giờ */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700">Khung giờ</label>
              <select
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
              >
                <option value="Buổi sáng (09:00 - 12:00)">Buổi sáng (09:00 - 12:00)</option>
                <option value="Buổi chiều (14:00 - 17:00)">Buổi chiều (14:00 - 17:00)</option>
                <option value="Buổi tối (18:00 - 21:00)">Buổi tối (18:00 - 21:00)</option>
              </select>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                className="w-full bg-black text-white text-xs font-semibold py-3 px-5 rounded-full hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
              >
                Xác nhận đặt lịch
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 5. Thư viện hình ảnh */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-stone-500 uppercase block mb-1">
              Thư viện hình ảnh
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
              Không gian nghỉ dưỡng tinh tế
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md font-light leading-relaxed">
            Khám phá vẻ đẹp kiến trúc đương đại kết hợp cùng thiên nhiên nguyên bản tại L'Étoile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-2xs cursor-pointer"
            >
              <img
                src={img.image}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] uppercase tracking-wider text-stone-300 block">
                  {img.category}
                </span>
                <h4 className="text-base font-serif font-medium text-white">
                  {img.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExperiencesPage;
