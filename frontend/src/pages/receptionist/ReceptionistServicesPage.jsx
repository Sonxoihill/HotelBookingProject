import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Printer,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Coins,
  Sparkles,
  Utensils,
  Car,
  Wine,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import AddServiceChargeModal from '../../components/receptionist/AddServiceChargeModal';

const INITIAL_SERVICE_CHARGES = [
  {
    id: 'SRV-4821',
    time: '10:15 - Hôm nay',
    roomCode: 'P1201',
    roomName: 'Grand Celestial Penthouse',
    guestName: 'Đỗ Minh Quân',
    guestTier: 'Black Diamond VIP',
    category: 'Minibar',
    serviceName: 'Rượu vang Chateau Margaux Grand Cru',
    unitPrice: 3800000,
    quantity: 1,
    totalAmount: 3800000,
    status: 'FOLIO_CHARGED',
    statusLabel: 'Đã nạp vào Folio',
    statusVariant: 'emerald',
    notes: 'Bộ phận Buồng phòng kiểm tra và báo về lúc 10:10.',
  },
  {
    id: 'SRV-4819',
    time: '09:30 - Hôm nay',
    roomCode: 'V101',
    roomName: 'Garden Sanctuary Villa',
    guestName: 'Trần Bảo Ngọc',
    guestTier: 'VIP Diamond',
    category: 'In-room Dining',
    serviceName: 'Bữa sáng Floating Breakfast tại hồ bơi riêng',
    unitPrice: 1450000,
    quantity: 2,
    totalAmount: 2900000,
    status: 'FOLIO_CHARGED',
    statusLabel: 'Đã nạp vào Folio',
    statusVariant: 'emerald',
    notes: 'Phục vụ kèm 02 ly nước cam tươi và cà phê Capuchino.',
  },
  {
    id: 'SRV-4815',
    time: '08:45 - Hôm nay',
    roomCode: 'P1202',
    roomName: 'Royal Sky Penthouse',
    guestName: 'Elena Rostova',
    guestTier: 'Platinum Member',
    category: 'Đưa đón Maybach',
    serviceName: 'Đưa đón sân bay Cam Ranh 1 chiều xe Maybach S680',
    unitPrice: 2500000,
    quantity: 1,
    totalAmount: 2500000,
    status: 'FOLIO_CHARGED',
    statusLabel: 'Đã nạp vào Folio',
    statusVariant: 'emerald',
    notes: 'Tài xế riêng đón khách lúc 08:00.',
  },
  {
    id: 'SRV-4810',
    time: 'Hôm qua, 20:30',
    roomCode: 'S802',
    roomName: 'Ocean Horizon Suite',
    guestName: 'Liam Vanderberg',
    guestTier: 'Executive Member',
    category: 'Spa & Wellness',
    serviceName: 'Liệu trình Massage đá nóng Thảo dược 90 phút',
    unitPrice: 2200000,
    quantity: 2,
    totalAmount: 4400000,
    status: 'FOLIO_CHARGED',
    statusLabel: 'Đã nạp vào Folio',
    statusVariant: 'emerald',
    notes: 'Khách sử dụng tại L\'Étoile Thermal Spa.',
  },
  {
    id: 'SRV-4798',
    time: 'Hôm qua, 18:00',
    roomCode: 'V102',
    roomName: 'Garden Sanctuary Villa',
    guestName: 'Bùi Hoàng Long',
    guestTier: 'Gold Member',
    category: 'Giặt là Laundry',
    serviceName: 'Giặt hấp 01 bộ Âu phục cao cấp (Suit)',
    unitPrice: 350000,
    quantity: 2,
    totalAmount: 700000,
    status: 'PAID_DIRECT',
    statusLabel: 'Đã thanh toán ngay',
    statusVariant: 'sand',
    notes: 'Khách thanh toán thẻ tín dụng tại quầy.',
  },
];

export const ReceptionistServicesPage = () => {
  const [servicesList, setServicesList] = useState(INITIAL_SERVICE_CHARGES);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAddService = (newRecord) => {
    setServicesList((prev) => [newRecord, ...prev]);
    showToast(`Đã nạp thành công ${formatVND(newRecord.totalAmount)} vào Folio phòng ${newRecord.roomCode}!`);
  };

  // Filter logic
  const filteredServices = useMemo(() => {
    return servicesList.filter((item) => {
      // Tab filter
      if (activeTab !== 'Tất cả' && item.category !== activeTab) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchRoom = item.roomCode.toLowerCase().includes(term);
        const matchGuest = item.guestName.toLowerCase().includes(term);
        const matchService = item.serviceName.toLowerCase().includes(term);
        const matchId = item.id.toLowerCase().includes(term);
        if (!matchRoom && !matchGuest && !matchService && !matchId) return false;
      }

      return true;
    });
  }, [servicesList, activeTab, searchTerm]);

  // Compute total revenue
  const totalRevenue = useMemo(() => {
    return servicesList.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [servicesList]);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto min-h-full flex flex-col justify-between select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 p-4 bg-stone-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-[#C59D5F]" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
              Dịch vụ & Tiêu thụ Minibar
            </h1>
            <p className="text-xs text-stone-500 font-light mt-1">
              Ghi nhận tiêu thụ minibar, dịch vụ ẩm thực tại phòng, spa và nạp trực tiếp vào Folio khách.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => showToast('Đang xuất bảng kê chi phí dịch vụ ca trực ra file PDF...')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-xs font-semibold text-stone-800 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer size={15} />
              <span>Xuất bảng kê ca trực</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>+ Thêm dịch vụ / Minibar mới</span>
            </button>
          </div>
        </div>

        {/* 2. Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Doanh thu dịch vụ */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">
              Tổng doanh thu dịch vụ
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {formatVND(totalRevenue)}
              </span>
            </div>
          </div>

          {/* Card 2: Tiêu thụ Minibar */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">
              Tiêu thụ Minibar hôm nay
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                18
              </span>
              <span className="text-xs text-stone-500 font-light">lượt phòng</span>
            </div>
          </div>

          {/* Card 3: Spa & Wellness */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">
              Dịch vụ Spa & Trị liệu
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                08
              </span>
              <span className="text-xs text-stone-500 font-light">lượt khách</span>
            </div>
          </div>

          {/* Card 4: Đưa đón Maybach */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">
              Đưa đón Maybach S680
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                05
              </span>
              <span className="text-xs text-stone-500 font-light">chuyến xe</span>
            </div>
          </div>
        </div>

        {/* 3. Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'Tất cả', label: `Tất cả (${servicesList.length})` },
              { id: 'Minibar', label: 'Minibar' },
              { id: 'In-room Dining', label: 'Ẩm thực tại phòng' },
              { id: 'Spa & Wellness', label: 'Spa & Trị liệu' },
              { id: 'Đưa đón Maybach', label: 'Đưa đón Maybach' },
              { id: 'Giặt là Laundry', label: 'Giặt là cao cấp' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm số phòng, tên khách, món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400 shadow-2xs"
            />
          </div>
        </div>

        {/* 4. Service Charges Data Table */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Mã GD & Giờ</th>
                  <th className="py-4 px-6">Phòng & Khách hàng</th>
                  <th className="py-4 px-6">Chi tiết dịch vụ / Mặt hàng</th>
                  <th className="py-4 px-6">Đơn giá & SL</th>
                  <th className="py-4 px-6">Tổng tiền</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredServices.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Mã GD */}
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-stone-900 block">
                        #{item.id}
                      </span>
                      <span className="text-stone-400 text-[11px] font-light">
                        {item.time}
                      </span>
                    </td>

                    {/* Phòng & Khách */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-stone-900">
                          {item.roomCode}
                        </span>
                        <span className="text-stone-400 text-[11px]">•</span>
                        <span className="font-bold text-stone-800">
                          {item.guestName}
                        </span>
                      </div>
                      <span className="text-[#C59D5F] text-[11px] font-medium block">
                        {item.guestTier}
                      </span>
                    </td>

                    {/* Chi tiết dịch vụ */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-semibold shrink-0">
                          {item.category}
                        </span>
                        <span className="font-medium text-stone-800 truncate max-w-xs">
                          {item.serviceName}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-stone-400 font-light mt-0.5 line-clamp-1 italic">
                          {item.notes}
                        </p>
                      )}
                    </td>

                    {/* Đơn giá & SL */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-stone-700 block">
                        {formatVND(item.unitPrice)}
                      </span>
                      <span className="text-stone-400 text-[11px]">
                        Số lượng: {item.quantity}
                      </span>
                    </td>

                    {/* Tổng tiền */}
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {formatVND(item.totalAmount)}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium ${
                          item.status === 'FOLIO_CHARGED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#FBF4EA] text-[#7A4B17] border border-[#F7E1BC]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'FOLIO_CHARGED' ? 'bg-emerald-500' : 'bg-[#C59D5F]'
                          }`}
                        ></span>
                        <span>{item.statusLabel}</span>
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Xem Folio thanh toán phòng ${item.roomCode}`)}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Xem Folio
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table pagination & count */}
          <div className="p-4 sm:px-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Hiển thị 1 - {filteredServices.length} trên {servicesList.length} giao dịch dịch vụ</span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-100 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-black text-white text-xs font-semibold cursor-pointer"
              >
                1
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-100 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2 select-none">
        <p>© 2025 L'Étoile Luxury Retreat</p>
        <p>Hệ thống Front Desk • Module Dịch vụ & Minibar</p>
      </div>

      {/* Add Service Modal */}
      <AddServiceChargeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddService={handleAddService}
      />
    </div>
  );
};

export default ReceptionistServicesPage;
