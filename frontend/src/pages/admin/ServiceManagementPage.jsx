import React, { useState, useMemo } from 'react';
import {
  ConciergeBell,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Coins,
  Sparkles,
  Utensils,
  Car,
  Wine,
  CheckCircle2,
  Clock,
  MoreVertical,
  ShieldCheck,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import AddServiceModal from '../../components/admin/AddServiceModal';

const INITIAL_SERVICES = [
  {
    id: 1,
    name: 'Rượu vang Chateau Margaux Grand Cru',
    sku: 'MB-WINE-01',
    category: 'Minibar & Đồ uống cao cấp',
    unit: 'Chai 750ml',
    price: 3800000,
    department: 'Bộ phận F&B & Quầy Bar',
    slaTime: 'Phục vụ ngay trong 15 phút',
    status: 'ACTIVE',
    statusLabel: 'Đang phục vụ',
  },
  {
    id: 2,
    name: 'Bữa sáng Floating Breakfast tại hồ bơi riêng',
    sku: 'FNB-FLT-02',
    category: 'In-room Dining (Ẩm thực tại phòng)',
    unit: 'Set 2 người',
    price: 1450000,
    department: 'Bếp trưởng & Bếp phòng',
    slaTime: 'Báo trước 30 phút',
    status: 'ACTIVE',
    statusLabel: 'Đang phục vụ',
  },
  {
    id: 3,
    name: 'Liệu trình Spa Thảo mộc Cung đình 90 phút',
    sku: 'SPA-ROY-03',
    category: 'Dịch vụ Spa & Wellness',
    unit: 'Liệu trình (90 Phút)',
    price: 2200000,
    department: "L'Étoile Spa & Trị liệu",
    slaTime: 'Báo trước 02 giờ',
    status: 'ACTIVE',
    statusLabel: 'Đang phục vụ',
  },
  {
    id: 4,
    name: 'Đưa đón sân bay Cam Ranh 1 chiều xe Maybach S680',
    sku: 'TRN-MAY-04',
    category: 'Đưa đón xe sang Maybach',
    unit: 'Chuyến 1 chiều',
    price: 2500000,
    department: 'Đội xe & Concierge sân bay',
    slaTime: 'Đặt trước 24 giờ',
    status: 'ACTIVE',
    statusLabel: 'Đang phục vụ',
  },
  {
    id: 5,
    name: 'Tour Du thuyền ngắm hoàng hôn vịnh biển',
    sku: 'EXP-YCT-05',
    category: 'Tour & Du thuyền riêng biệt',
    unit: 'Chuyến riêng 4 giờ',
    price: 18500000,
    department: 'Đội xe & Concierge sân bay',
    slaTime: 'Đặt trước 24 giờ',
    status: 'ACTIVE',
    statusLabel: 'Đang phục vụ',
  },
  {
    id: 6,
    name: 'Giặt sấy ủi cao cấp trang phục dạ tiệc',
    sku: 'LND-EXP-06',
    category: 'Giặt ủi & Chăm sóc trang phục',
    unit: 'Bộ',
    price: 350000,
    department: 'Buồng phòng & Giặt ủi',
    slaTime: 'Phục vụ ngay trong 15 phút',
    status: 'ACTIVE',
    statusLabel: 'Đang phục vụ',
  },
];

export const ServiceManagementPage = () => {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAddService = (newServiceData) => {
    const created = {
      id: Date.now(),
      ...newServiceData,
      status: 'ACTIVE',
      statusLabel: 'Đang phục vụ',
    };
    setServices([created, ...services]);
    showToast(`Đã thêm dịch vụ "${created.name}" thành công!`);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Xóa dịch vụ "${name}" khỏi danh mục phục vụ?`)) {
      setServices(services.filter((s) => s.id !== id));
      showToast(`Đã xóa dịch vụ "${name}"`);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat =
        activeCategory === 'ALL' ||
        (activeCategory === 'MINIBAR' && s.category.includes('Minibar')) ||
        (activeCategory === 'DINING' && s.category.includes('Dining')) ||
        (activeCategory === 'SPA' && s.category.includes('Spa')) ||
        (activeCategory === 'TRANSPORT' && s.category.includes('Maybach'));

      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [services, activeCategory, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
            DANH MỤC TIỆN ÍCH • THỰC ĐƠN & DỊCH VỤ NGHỈ DƯỠNG
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Quản lý Danh mục Dịch vụ
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Cấu hình bảng giá thực đơn ẩm thực tại phòng, minibar rượu vang, spa & wellness, đưa đón xe sang Maybach và trải nghiệm riêng biệt.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => showToast('Đang kết xuất bảng giá dịch vụ Menu PDF chuẩn 5 sao...')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={14} className="text-stone-500" />
            <span>Xuất thực đơn / Menu PDF</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ THÊM DỊCH VỤ MỚI</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TỔNG SỐ DỊCH VỤ
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <ConciergeBell size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {services.length} <span className="text-sm font-normal font-sans text-stone-500">mục dịch vụ</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Đang niêm yết phục vụ khách
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              DANH MỤC HOẠT ĐỘNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-amber-800">
              <Utensils size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            06 <span className="text-sm font-normal font-sans text-stone-500">nhóm dịch vụ</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Minibar, F&B, Spa, Xe sang, Tour, Giặt
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TỶ LỆ GHI NỢ FOLIO
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Coins size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            94% <span className="text-sm font-normal font-sans text-stone-500">Room Charge</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Khách thanh toán khi trả phòng
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              DOANH THU TRUNG BÌNH / NGÀY
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-amber-800">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            24.850.000 <span className="text-sm font-normal font-sans text-stone-500">đ</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Tăng trưởng +18.4%</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Tất cả ({services.length})
          </button>
          <button
            onClick={() => setActiveCategory('MINIBAR')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'MINIBAR'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Minibar & Đồ uống
          </button>
          <button
            onClick={() => setActiveCategory('DINING')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'DINING'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            In-room Dining
          </button>
          <button
            onClick={() => setActiveCategory('SPA')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'SPA'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Spa & Wellness
          </button>
          <button
            onClick={() => setActiveCategory('TRANSPORT')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'TRANSPORT'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Đưa đón Maybach
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm tên dịch vụ, mã SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Services Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                <th className="py-3.5 px-6">DỊCH VỤ & SKU</th>
                <th className="py-3.5 px-4">NHÓM DANH MỤC</th>
                <th className="py-3.5 px-4 text-center">ĐƠN VỊ TÍNH</th>
                <th className="py-3.5 px-4 text-right">ĐƠN GIÁ NIÊM YẾT</th>
                <th className="py-3.5 px-4">THỜI GIAN SLA</th>
                <th className="py-3.5 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredServices.map((srv) => (
                <tr key={srv.id} className="hover:bg-stone-50/60 transition-colors">
                  {/* Tên dịch vụ & SKU */}
                  <td className="py-4 px-6">
                    <p className="font-bold text-stone-900">{srv.name}</p>
                    <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                      {srv.sku} • {srv.department}
                    </p>
                  </td>

                  {/* Nhóm danh mục */}
                  <td className="py-4 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium text-[11px] border border-stone-200/70">
                      {srv.category}
                    </span>
                  </td>

                  {/* Đơn vị tính */}
                  <td className="py-4 px-4 text-center text-stone-600 font-medium whitespace-nowrap">
                    {srv.unit}
                  </td>

                  {/* Đơn giá niêm yết */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <p className="font-bold text-stone-900 text-xs">{formatVND(srv.price)}</p>
                    <p className="text-[9px] text-stone-400 uppercase tracking-wider">ĐÃ GỒM VAT & SVC</p>
                  </td>

                  {/* SLA */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                      <Clock size={12} className="text-stone-400" />
                      <span>{srv.slaTime}</span>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#FDF4E7] text-amber-900 border border-amber-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      {srv.statusLabel}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => showToast(`Mở chỉnh sửa dịch vụ: ${srv.name}`)}
                        className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(srv.id, srv.name)}
                        className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddService={handleAddService}
      />
    </div>
  );
};

export default ServiceManagementPage;
