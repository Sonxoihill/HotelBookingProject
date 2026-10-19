import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  BedDouble,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import serviceService from '../../services/serviceService';
import extraService from '../../services/extraService';
import { bookingFolioSync, PRESET_10_SERVICES } from '../../utils/bookingFolioSync';

export const AddServiceChargeModal = ({ isOpen, onClose, onAddService, onServiceAdded }) => {
  const [services, setServices] = useState(PRESET_10_SERVICES);
  const [checkedInBookings, setCheckedInBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [chargeToFolio, setChargeToFolio] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Lấy danh sách 10 dịch vụ từ API GET /api/v1/services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceService.getServices();
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          // Gộp dữ liệu từ API với metadata unit
          const mapped = data.map((item, index) => ({
            id: item.id || index + 1,
            name: item.name,
            price: item.price || 100000,
            unit: item.unit || PRESET_10_SERVICES[index % PRESET_10_SERVICES.length]?.unit || 'Lượt',
            category: item.category || PRESET_10_SERVICES[index % PRESET_10_SERVICES.length]?.category || 'Dịch vụ',
            description: item.description || '',
          }));
          setServices(mapped);
          if (mapped.length > 0) setSelectedServiceId(mapped[0].id);
        } else {
          setServices(PRESET_10_SERVICES);
          setSelectedServiceId(PRESET_10_SERVICES[0].id);
        }
      } catch (err) {
        console.warn('API GET /api/v1/services chưa có backend hoặc offline, sử dụng 10 dịch vụ mặc định:', err);
        setServices(PRESET_10_SERVICES);
        setSelectedServiceId(PRESET_10_SERVICES[0].id);
      }
    };

    fetchServices();
  }, []);

  // 2. Lọc danh sách các phòng/đơn đang ở trạng thái CHECKED_IN
  useEffect(() => {
    const list = bookingFolioSync.getCheckedInBookings();
    setCheckedInBookings(list);
    if (list.length > 0) {
      setSelectedBookingId(list[0].id);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBooking = checkedInBookings.find((b) => b.id === selectedBookingId) || checkedInBookings[0] || {};
  const currentService = services.find((s) => String(s.id) === String(selectedServiceId)) || services[0] || {};
  const unitPrice = currentService?.price || 0;
  const numQuantity = Number(quantity);
  const totalAmount = unitPrice * numQuantity;

  // Validation Form: Chặn nếu chưa chọn dịch vụ hoặc số lượng <= 0
  const isServiceValid = Boolean(selectedServiceId);
  const isQuantityValid = Number.isInteger(numQuantity) && numQuantity > 0;
  const isFormValid = isServiceValid && isQuantityValid && Boolean(selectedBookingId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedServiceId) {
      setErrorMessage('Vui lòng chọn dịch vụ trước khi thêm!');
      return;
    }

    if (!isQuantityValid) {
      setErrorMessage('Số lượng dịch vụ phải lớn hơn 0!');
      return;
    }

    if (!selectedBookingId) {
      setErrorMessage('Vui lòng chọn phòng/đơn đang lưu trú (CHECKED_IN)!');
      return;
    }

    setIsSubmitting(true);
    try {
      // 3. Gọi API POST /api/v1/receptionist/bookings/{bookingId}/services
      const servicePayload = {
        serviceId: currentService.id,
        serviceName: currentService.name,
        unit: currentService.unit,
        unitPrice: currentService.price,
        quantity: numQuantity,
        totalAmount,
        notes: notes.trim(),
      };

      try {
        await extraService.addServiceToBooking(selectedBookingId, servicePayload);
      } catch (apiErr) {
        console.warn('API POST /api/v1/receptionist/bookings/' + selectedBookingId + '/services offline:', apiErr);
      }

      // Cập nhật ngay vào Hóa đơn (Folio) đồng bộ
      const updatedBooking = bookingFolioSync.addServiceToBooking(selectedBookingId, servicePayload);

      const newRecord = {
        id: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
        time: 'Vừa xong',
        bookingId: selectedBookingId,
        roomCode: currentBooking.roomCode,
        roomName: currentBooking.roomName,
        guestName: currentBooking.guestName,
        guestTier: currentBooking.guestTier,
        category: currentService.category,
        serviceName: currentService.name,
        unit: currentService.unit,
        unitPrice,
        quantity: numQuantity,
        totalAmount,
        status: chargeToFolio ? 'FOLIO_CHARGED' : 'PAID_DIRECT',
        statusLabel: chargeToFolio ? 'Đã nạp vào Folio' : 'Đã thanh toán ngay',
        notes: notes || 'Nạp trực tiếp vào Folio',
      };

      if (onAddService) {
        onAddService(newRecord);
      }
      if (onServiceAdded) {
        onServiceAdded(updatedBooking, newRecord);
      }

      onClose();
    } catch (err) {
      console.error('Lỗi khi nạp dịch vụ:', err);
      setErrorMessage('Có lỗi xảy ra khi nạp dịch vụ vào hóa đơn!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="space-y-0.5">
            <h3 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
              <Coins size={18} className="text-[#C59D5F]" />
              <span>Thêm Dịch vụ Phát sinh vào Hóa đơn</span>
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Nạp dịch vụ vào hóa đơn (Folio) của phòng đang nhận phòng (CHECKED_IN).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Lọc danh sách các phòng/đơn đang ở trạng thái CHECKED_IN */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BedDouble size={14} className="text-[#C59D5F]" />
                <span>Phòng / Đơn đặt phòng (Đang lưu trú - CHECKED_IN) *</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {checkedInBookings.length} phòng đang ở
              </span>
            </label>

            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 font-semibold focus:outline-none focus:border-stone-400"
            >
              {checkedInBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  Phòng {b.roomCode} — {b.guestName} ({b.guestTier}) • {b.stayDuration}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Chọn dịch vụ từ 10 dịch vụ kèm đơn vị tính unit */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800 flex items-center justify-between">
              <span>Dịch vụ phát sinh (API GET /api/v1/services) *</span>
              <span className="text-[10px] text-stone-400">10 dịch vụ khả dụng</span>
            </label>

            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-stone-400"
            >
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} — {formatVND(svc.price)} / {svc.unit || 'Lượt'} ({svc.category})
                </option>
              ))}
            </select>

            {/* Chi tiết dịch vụ đã chọn */}
            {currentService && (
              <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/70 text-[11px] text-stone-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-800">{currentService.name}</span>
                  <span className="text-stone-400 ml-2 italic">({currentService.description || currentService.category})</span>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="font-serif font-bold text-stone-900 text-xs">{formatVND(currentService.price)}</span>
                  <span className="text-stone-400 text-[10px] block">/ {currentService.unit}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Số lượng & Validation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-800">
                Số lượng *
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(0, Number(q) - 1))}
                  className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={`w-full text-center bg-stone-50 border rounded-xl py-2 text-stone-900 font-bold focus:outline-none ${
                    !isQuantityValid ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-stone-200 focus:border-stone-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, Number(q) + 1))}
                  className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
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
              <label className="font-semibold text-stone-800">Đơn vị tính & Ghi chú</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Phục vụ tại ban công lúc 09:30..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {/* Bảng tính tổng tiền */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">
                  {formatVND(unitPrice)} × {numQuantity} {currentService?.unit}
                </span>
                <span className="font-bold text-stone-900 text-sm">
                  Tổng tiền dịch vụ thêm vào
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-stone-900">
                {formatVND(totalAmount > 0 ? totalAmount : 0)}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={chargeToFolio}
                  onChange={(e) => setChargeToFolio(e.target.checked)}
                  className="rounded text-black focus:ring-0 w-4 h-4 cursor-pointer accent-black"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Nạp trực tiếp vào Folio phòng {currentBooking.roomCode} (Đồng bộ Check-out)
                </span>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions: Validation chặn bấm nếu chưa chọn DV hoặc SL <= 0 */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full border border-stone-200 hover:bg-stone-100 text-stone-600 font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`px-6 py-2.5 rounded-full font-semibold shadow-md transition-all flex items-center gap-1.5 ${
                !isFormValid || isSubmitting
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                  : 'bg-black hover:bg-stone-800 text-white cursor-pointer hover:scale-[1.02]'
              }`}
            >
              <CheckCircle2 size={15} />
              <span>{isSubmitting ? 'Đang nạp...' : 'Thêm vào hóa đơn'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceChargeModal;
