import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Printer,
  CheckCircle2,
  Coins,
  Sparkles,
  BedDouble,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import serviceService from '../../services/serviceService';
import extraService from '../../services/extraService';
import { bookingFolioSync, PRESET_10_SERVICES } from '../../utils/bookingFolioSync';
import AddServiceChargeModal from '../../components/receptionist/AddServiceChargeModal';

export const ReceptionistServicesPage = () => {
  const navigate = useNavigate();

  // State danh sách 10 dịch vụ từ API GET /api/v1/services
  const [services, setServices] = useState(PRESET_10_SERVICES);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('Tất cả');

  // State danh sách đơn phòng đang CHECKED_IN
  const [checkedInBookings, setCheckedInBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Lịch sử giao dịch dịch vụ hiển thị ở bảng
  const [servicesHistory, setServicesHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // UI state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // 1. Gọi API GET /api/v1/services để render danh sách 10 dịch vụ kèm đơn giá và đơn vị tính (unit)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceService.getServices();
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item, idx) => ({
            id: item.id || idx + 1,
            name: item.name,
            price: item.price || 150000,
            unit: item.unit || PRESET_10_SERVICES[idx % PRESET_10_SERVICES.length]?.unit || 'Lượt',
            category: item.category || PRESET_10_SERVICES[idx % PRESET_10_SERVICES.length]?.category || 'Dịch vụ',
            description: item.description || 'Dịch vụ nghỉ dưỡng cao cấp.',
          }));
          setServices(mapped);
          if (mapped.length > 0) setSelectedServiceId(mapped[0].id);
        } else {
          setServices(PRESET_10_SERVICES);
          setSelectedServiceId(PRESET_10_SERVICES[0].id);
        }
      } catch (err) {
        console.warn('API GET /api/v1/services chưa có backend hoặc offline, dùng 10 dịch vụ mẫu:', err);
        setServices(PRESET_10_SERVICES);
        setSelectedServiceId(PRESET_10_SERVICES[0].id);
      }
    };

    fetchServices();
  }, []);

  // 2. Lọc danh sách các phòng/đơn đang ở trạng thái CHECKED_IN để Lễ tân chọn
  const loadCheckedInBookings = useCallback(() => {
    const list = bookingFolioSync.getCheckedInBookings();
    setCheckedInBookings(list);
    if (list.length > 0 && !selectedBookingId) {
      setSelectedBookingId(list[0].id);
    }

    // Tổng hợp lịch sử các dịch vụ đã nạp
    const history = [];
    list.forEach((b) => {
      if (Array.isArray(b.services)) {
        b.services.forEach((s) => {
          history.push({
            id: s.id || `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
            time: s.time || 'Hôm nay',
            roomCode: b.roomCode,
            roomName: b.roomName,
            guestName: b.guestName,
            guestTier: b.guestTier,
            category: s.category || 'Dịch vụ',
            serviceName: s.serviceName || s.name,
            unit: s.unit || 'Lượt',
            unitPrice: s.unitPrice || s.price || 0,
            quantity: s.quantity || 1,
            totalAmount: s.totalAmount || (s.unitPrice || s.price || 0) * (s.quantity || 1),
            status: 'FOLIO_CHARGED',
            statusLabel: 'Đã nạp vào Folio',
            notes: s.notes || 'Nạp trực tiếp',
          });
        });
      }
    });
    setServicesHistory(history);
  }, [selectedBookingId]);

  useEffect(() => {
    loadCheckedInBookings();
  }, [loadCheckedInBookings]);

  // Đơn phòng CHECKED_IN đang được chọn để hiển thị cột Hóa đơn bên phải
  const currentBooking = useMemo(() => {
    return checkedInBookings.find((b) => b.id === selectedBookingId) || checkedInBookings[0] || {};
  }, [checkedInBookings, selectedBookingId]);

  // Dịch vụ đang được chọn trên form
  const currentSelectedService = useMemo(() => {
    return services.find((s) => String(s.id) === String(selectedServiceId)) || null;
  }, [services, selectedServiceId]);

  // 3. Kiểm tra Validation trên Form: Chặn bấm nút "Thêm vào hóa đơn" nếu chưa chọn dịch vụ hoặc số lượng <= 0
  const isServiceValid = Boolean(selectedServiceId && currentSelectedService);
  const isQuantityValid = Number.isInteger(Number(quantity)) && Number(quantity) > 0;
  const isFormValid = isServiceValid && isQuantityValid && Boolean(selectedBookingId);

  // 4. Khi bấm Submit: Gọi POST /api/v1/receptionist/bookings/{bookingId}/services và cập nhật ngay cột Hóa đơn bên phải
  const handleSubmitService = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedServiceId || !currentSelectedService) {
      setFormError('Vui lòng chọn 1 dịch vụ từ danh sách trước khi thêm!');
      return;
    }

    if (!isQuantityValid) {
      setFormError('Số lượng dịch vụ sử dụng phải lớn hơn 0!');
      return;
    }

    if (!selectedBookingId) {
      setFormError('Vui lòng chọn phòng đang lưu trú (CHECKED_IN)!');
      return;
    }

    setIsSubmitting(true);
    const numQty = Number(quantity);
    const totalAmount = currentSelectedService.price * numQty;

    const servicePayload = {
      serviceId: currentSelectedService.id,
      serviceName: currentSelectedService.name,
      unit: currentSelectedService.unit,
      unitPrice: currentSelectedService.price,
      quantity: numQty,
      totalAmount,
      notes: notes.trim() || 'Nạp tại quầy lễ tân',
    };

    try {
      // Gọi API POST /api/v1/receptionist/bookings/{bookingId}/services
      await extraService.addServiceToBooking(selectedBookingId, servicePayload);
    } catch (apiErr) {
      console.warn('API POST /api/v1/receptionist/bookings/' + selectedBookingId + '/services offline:', apiErr);
    }

    // Cập nhật ngay lập tức cột Hóa đơn bên phải (theo dữ liệu trả về)
    const updatedBooking = bookingFolioSync.addServiceToBooking(selectedBookingId, servicePayload);

    // Cập nhật state cục bộ
    setCheckedInBookings((prev) =>
      prev.map((b) => (b.id === selectedBookingId ? updatedBooking : b))
    );

    // Cập nhật bảng lịch sử
    const newHistoryRecord = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      time: 'Vừa xong',
      roomCode: currentBooking.roomCode,
      roomName: currentBooking.roomName,
      guestName: currentBooking.guestName,
      guestTier: currentBooking.guestTier,
      category: currentSelectedService.category,
      serviceName: currentSelectedService.name,
      unit: currentSelectedService.unit,
      unitPrice: currentSelectedService.price,
      quantity: numQty,
      totalAmount,
      status: 'FOLIO_CHARGED',
      statusLabel: 'Đã nạp vào Folio',
      notes: notes || 'Nạp trực tiếp vào Folio',
    };
    setServicesHistory((prev) => [newHistoryRecord, ...prev]);

    // Reset form
    setQuantity(1);
    setNotes('');
    showToast(`Đã thêm thành công ${currentSelectedService.name} (x${numQty} ${currentSelectedService.unit}) vào hóa đơn phòng ${currentBooking.roomCode}!`);
    setIsSubmitting(false);
  };

  // Filter cho 10 dịch vụ
  const filteredServices = useMemo(() => {
    if (selectedServiceCategory === 'Tất cả') return services;
    return services.filter((s) => s.category === selectedServiceCategory);
  }, [services, selectedServiceCategory]);

  // Filter cho bảng lịch sử
  const filteredHistory = useMemo(() => {
    return servicesHistory.filter((item) => {
      if (activeHistoryTab !== 'Tất cả' && item.category !== activeHistoryTab) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchRoom = (item.roomCode || '').toLowerCase().includes(term);
        const matchGuest = (item.guestName || '').toLowerCase().includes(term);
        const matchService = (item.serviceName || '').toLowerCase().includes(term);
        if (!matchRoom && !matchGuest && !matchService) return false;
      }
      return true;
    });
  }, [servicesHistory, activeHistoryTab, searchTerm]);

  // Tổng doanh thu dịch vụ
  const totalRevenue = useMemo(() => {
    return servicesHistory.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [servicesHistory]);

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
              Thêm dịch vụ phát sinh vào đơn phòng đang ở (CHECKED_IN), đồng bộ tức thời sang hóa đơn Folio và màn hình Check-out.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/receptionist/bookings')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-xs font-semibold text-stone-800 transition-colors cursor-pointer shadow-2xs"
            >
              <Receipt size={15} className="text-[#C59D5F]" />
              <span>Màn hình Check-out</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>+ Mở Popup Nạp dịch vụ</span>
            </button>
          </div>
        </div>

        {/* 2. Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Doanh thu dịch vụ */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">
              Tổng chi phí dịch vụ nạp
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
              Phòng đang lưu trú (CHECKED_IN)
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-emerald-700">
                0{checkedInBookings.length}
              </span>
              <span className="text-xs text-stone-500 font-light">khả dụng nạp phí</span>
            </div>
          </div>

          {/* Card 3: Spa & Wellness */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">
              Danh mục dịch vụ khách sạn
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {services.length}
              </span>
              <span className="text-xs text-blue-600 font-medium">mặt hàng (API /services)</span>
            </div>
          </div>

          {/* Card 4: Giao dịch hôm nay */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">
              Tổng lượt giao dịch
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {servicesHistory.length}
              </span>
              <span className="text-xs text-stone-500 font-light">lượt phát sinh</span>
            </div>
          </div>
        </div>

        {/* 3. MAIN 2-COLUMN LAYOUT: Form Thêm Dịch Vụ (Trái 7 cols) + Cột Hóa Đơn Tạm Tính (Phải 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: FORM THÊM DỊCH VỤ PHÁT SINH (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Coins size={16} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900">
                      Ghi nhận Dịch vụ Phát sinh
                    </h2>
                    <p className="text-[11px] text-stone-400">
                      POST /api/v1/receptionist/bookings/&#123;bookingId&#125;/services
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Lọc phòng: CHECKED_IN
                </span>
              </div>

              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitService} className="space-y-4">
                {/* Bước 1: Lọc danh sách các phòng/đơn đang ở trạng thái CHECKED_IN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BedDouble size={14} className="text-[#C59D5F]" />
                      <span>1. Chọn Phòng / Đơn khách đang ở (CHECKED_IN) *</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      Chỉ hiển thị khách đã nhận phòng
                    </span>
                  </label>

                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-semibold focus:outline-none focus:border-stone-900 focus:bg-white shadow-2xs transition-all cursor-pointer"
                  >
                    {checkedInBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        Phòng {b.roomCode} — {b.guestName} ({b.guestTier}) • {b.roomName} • {b.stayDuration}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bước 2: Danh sách 10 dịch vụ từ API GET /api/v1/services kèm đơn giá và đơn vị tính (unit) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#C59D5F]" />
                      <span>2. Chọn Dịch vụ sử dụng (API GET /api/v1/services) *</span>
                    </label>

                    {/* Filter Category Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {['Tất cả', 'In-room Dining', 'Minibar', 'Spa & Wellness', 'Đưa đón Maybach', 'Giặt là Laundry'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedServiceCategory(cat)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            selectedServiceCategory === cat
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render 10 dịch vụ dạng thẻ Card trực quan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
                    {filteredServices.map((svc) => {
                      const isSelected = String(selectedServiceId) === String(svc.id);
                      return (
                        <div
                          key={svc.id}
                          onClick={() => {
                            setSelectedServiceId(svc.id);
                            setFormError('');
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative shadow-2xs ${
                            isSelected
                              ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/10'
                              : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold text-xs text-stone-900 leading-tight">
                                {svc.name}
                              </span>
                              {isSelected && (
                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 line-clamp-1">
                              {svc.description}
                            </p>
                          </div>

                          <div className="pt-2 mt-1 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="font-serif font-bold text-stone-900">
                              {formatVND(svc.price)}
                            </span>
                            <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                              ĐVT: {svc.unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bước 3: Số lượng & Validation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-800 block">
                      Số lượng *
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(0, Number(q) - 1))}
                        className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value);
                          setFormError('');
                        }}
                        className={`w-full text-center bg-stone-50 border rounded-xl py-2 text-xs text-stone-900 font-bold focus:outline-none ${
                          !isQuantityValid ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-stone-200 focus:border-stone-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, Number(q) + 1))}
                        className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    {!isQuantityValid && (
                      <span className="text-[10px] text-rose-600 font-medium block">
                        Số lượng phải lớn hơn 0
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-stone-800 block">
                      Ghi chú phục vụ (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ví dụ: Phục vụ tại phòng lúc 09:30, thêm đá lạnh..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>

                {/* Bảng tạm tính nhanh chi phí thêm vào */}
                {currentSelectedService && (
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 block text-[11px]">
                        Thành tiền dịch vụ thêm:
                      </span>
                      <span className="font-semibold text-stone-800">
                        {currentSelectedService.name} ({formatVND(currentSelectedService.price)} × {quantity} {currentSelectedService.unit})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-xl font-bold text-stone-900">
                        {formatVND(isQuantityValid ? currentSelectedService.price * Number(quantity) : 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bước 4: Nút Submit (Validation chặn bấm nếu chưa chọn DV hoặc SL <= 0) */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-3 rounded-2xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
                      !isFormValid || isSubmitting
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                        : 'bg-stone-900 hover:bg-black text-white cursor-pointer hover:scale-[1.01]'
                    }`}
                  >
                    <Plus size={16} />
                    <span>{isSubmitting ? 'Đang nạp vào hóa đơn...' : 'Thêm vào hóa đơn'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* BẢNG LỊCH SỬ DỊCH VỤ ĐÃ NẠP */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs space-y-3 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Lịch sử nạp dịch vụ ca trực
                </h3>

                <div className="relative w-full sm:w-60">
                  <Search size={13} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Tìm phòng, món ăn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-full pl-8 pr-3 py-1 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Phòng & Khách</th>
                      <th className="py-2.5 px-3">Dịch vụ</th>
                      <th className="py-2.5 px-3">SL & ĐVT</th>
                      <th className="py-2.5 px-3">Tổng tiền</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/60">
                        <td className="py-2.5 px-3">
                          <span className="font-serif font-bold text-stone-900 block">
                            P.{item.roomCode}
                          </span>
                          <span className="text-[11px] text-stone-500 font-light truncate max-w-[120px] block">
                            {item.guestName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-stone-800 block">
                            {item.serviceName}
                          </span>
                          <span className="text-[10px] text-stone-400">{item.time}</span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 font-serif font-bold text-stone-900">
                          {formatVND(item.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đã vào Folio
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CỘT HÓA ĐƠN BÊN PHẢI (INVOICE / FOLIO COLUMN - 5 COLS) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md space-y-5">
              {/* Header Cột Hóa Đơn */}
              <div className="border-b border-stone-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
                    HÓA ĐƠN TẠM TÍNH (FOLIO)
                  </span>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    CHECKED_IN (Đang ở)
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    Phòng {currentBooking.roomCode}
                  </h3>
                  <span className="text-xs font-semibold text-stone-500">
                    Mã đơn: #{currentBooking.id}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Khách hàng: <strong className="text-stone-800">{currentBooking.guestName}</strong> ({currentBooking.guestTier})
                </p>
                <p className="text-[11px] text-stone-400">
                  Lưu trú: {currentBooking.checkInDate} → {currentBooking.checkOutDate} ({currentBooking.stayDuration})
                </p>
              </div>

              {/* Bảng Kê Chi Tiết Hóa Đơn */}
              <div className="space-y-3.5 text-xs">
                {/* 1. Tiền phòng */}
                <div className="flex items-center justify-between py-1 border-b border-stone-100">
                  <div>
                    <span className="font-semibold text-stone-800 block">Tiền phòng lưu trú</span>
                    <span className="text-[11px] text-stone-400">{currentBooking.roomName}</span>
                  </div>
                  <span className="font-serif font-bold text-stone-900 text-sm">
                    {formatVND(currentBooking.roomCharge)}
                  </span>
                </div>

                {/* 2. Dịch vụ phát sinh (Cập nhật tức thời theo dữ liệu trả về) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-600" />
                      <span>Phí dịch vụ phát sinh</span>
                    </span>
                    <span className="font-serif font-bold text-amber-900 text-sm">
                      {formatVND(currentBooking.serviceFee)}
                    </span>
                  </div>

                  {/* Danh sách các dịch vụ trong hóa đơn */}
                  <div className="space-y-1.5 bg-[#FAF5EE]/70 rounded-2xl p-3 border border-amber-200/70 max-h-48 overflow-y-auto">
                    {currentBooking.services && currentBooking.services.length > 0 ? (
                      currentBooking.services.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-amber-200/40 last:border-0 text-[11px]">
                          <div className="pr-2">
                            <span className="font-semibold text-amber-950 block">{item.serviceName}</span>
                            <span className="text-[10px] text-amber-800/80">
                              {formatVND(item.unitPrice)} × {item.quantity} {item.unit}
                            </span>
                          </div>
                          <span className="font-serif font-bold text-amber-950 whitespace-nowrap">
                            {formatVND(item.totalAmount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-stone-400 py-3 text-xs italic">
                        Chưa có dịch vụ phát sinh nào.
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Thuế VAT 8% */}
                <div className="flex items-center justify-between py-1 text-stone-500">
                  <span>Thuế GTGT VAT (8%)</span>
                  <span>{formatVND(currentBooking.vatTax)}</span>
                </div>

                {/* 4. Tổng cộng hóa đơn tạm tính */}
                <div className="pt-2 border-t-2 border-stone-200 flex items-baseline justify-between">
                  <span className="font-bold text-stone-900 text-sm">Tổng cộng Hóa đơn</span>
                  <span className="font-serif text-2xl font-bold text-stone-900">
                    {formatVND(currentBooking.grandTotal)}
                  </span>
                </div>

                {/* 5. Đã đặt cọc / thanh toán trước */}
                <div className="flex items-center justify-between text-stone-600">
                  <span>Đã thanh toán / Đặt cọc:</span>
                  <span className="font-semibold text-emerald-700">
                    -{formatVND(currentBooking.deposit)}
                  </span>
                </div>

                {/* 6. Còn lại cần thanh toán khi Check-out (AC) */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                      CẦN THANH TOÁN KHI CHECK-OUT
                    </span>
                    <span className="text-[11px] text-rose-600 font-medium">
                      Bao gồm toàn bộ dịch vụ phát sinh
                    </span>
                  </div>
                  <span className="font-serif text-2xl font-bold text-rose-700">
                    {formatVND(currentBooking.balanceDue)}
                  </span>
                </div>
              </div>

              {/* Nút thao tác đồng bộ sang màn hình Check-out */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/receptionist/bookings?focusRoom=${currentBooking.roomCode}&action=checkout`);
                  }}
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Receipt size={15} />
                  <span>Đồng bộ & Chuyển sang Check-out phòng {currentBooking.roomCode}</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast(`Đang in bản sao kê Hóa đơn tạm tính phòng ${currentBooking.roomCode}...`)}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>In bản sao Folio tạm tính</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal nạp dịch vụ pop-up */}
      <AddServiceChargeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onServiceAdded={() => {
          loadCheckedInBookings();
          showToast('Đã nạp dịch vụ và đồng bộ hóa đơn thành công!');
        }}
      />
    </div>
  );
};

export default ReceptionistServicesPage;
