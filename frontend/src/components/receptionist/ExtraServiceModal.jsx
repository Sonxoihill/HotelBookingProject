import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatVND } from '../../utils/formatters';
import { Plus, Trash2 } from 'lucide-react';
import serviceService from '../../services/serviceService';
import extraService from '../../services/extraService';
import bookingService from '../../services/bookingService';

export const ExtraServiceModal = ({ isOpen, onClose, booking, onSave }) => {
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceService.getServices();
        const data = res?.data || res;
        if (Array.isArray(data)) {
          const mapped = data.map((item, idx) => ({
            id: item.id || idx + 1,
            name: item.name,
            price: item.price || 0,
            unit: item.unit || 'Lần',
            category: item.category || 'Dịch vụ phát sinh',
          }));
          setAvailableServices(mapped);
        } else {
          setAvailableServices([]);
        }
      } catch (err) {
        console.error('Lỗi tải dịch vụ:', err);
      }
    };

    if (isOpen) {
      fetchServices();
      setSelectedItems([]);
    }
  }, [isOpen]);

  const addItem = (svc) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.serviceId === svc.id);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === svc.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          serviceId: svc.id,
          name: svc.name,
          unit: svc.unit || 'Lượt',
          quantity: 1,
          price: svc.price,
        },
      ];
    });
  };

  const updateQuantity = (serviceId, newQty) => {
    if (newQty <= 0) {
      removeItem(serviceId);
      return;
    }
    setSelectedItems((prev) =>
      prev.map((item) => (item.serviceId === serviceId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeItem = (serviceId) => {
    setSelectedItems((prev) => prev.filter((item) => item.serviceId !== serviceId));
  };

  const totalExtra = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Validation: Chặn lưu nếu chưa chọn dịch vụ hoặc tổng số lượng <= 0
  const isFormValid = selectedItems.length > 0 && selectedItems.every((item) => item.quantity > 0);

  const handleSaveToInvoice = async () => {
    if (!isFormValid || !booking?.id) return;
    setIsLoading(true);

    try {
      // Gọi API POST /api/v1/receptionist/bookings/{bookingId}/services
      const itemsPayload = selectedItems.map((item) => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
      }));
      await bookingService.addServiceToBooking(booking.id, itemsPayload);

      // Thông báo cập nhật Folio đến các component khác
      window.dispatchEvent(new CustomEvent('hotel_folio_updated', { detail: { bookingId: booking.id } }));

      if (onSave) {
        onSave({ bookingId: booking?.id, items: selectedItems, totalExtra });
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi nạp dịch vụ vào hóa đơn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Thêm Dịch vụ phát sinh - Đơn #${booking?.code || booking?.id || 'BK-8821'}`}
      maxWidth="max-w-2xl"
      footer={
        <>
          <div className="mr-auto text-xs text-slate-500">
            Tổng cộng thêm:{' '}
            <span className="text-base font-bold text-amber-700">{formatVND(totalExtra)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
            onClick={handleSaveToInvoice}
            className={!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Lưu vào hóa đơn
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Danh mục 10 dịch vụ từ API GET /api/v1/services */}
        <div className="space-y-2 border-r border-slate-100 pr-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 block">
              Danh mục dịch vụ khả dụng (10 dịch vụ)
            </span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {availableServices.map((svc) => (
              <div
                key={svc.id}
                className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 pr-2">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{svc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-stone-900">{formatVND(svc.price)}</span>
                    <span className="text-[10px] text-slate-400">/ {svc.unit || 'Lượt'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addItem(svc)}
                  className="p-1.5 rounded-lg bg-stone-900 text-white hover:bg-black transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danh sách dịch vụ đã chọn & số lượng */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Dịch vụ đã gán vào hóa đơn</span>
          {selectedItems.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
              Chưa chọn dịch vụ nào. Click dấu (+) bên trái để thêm.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <div
                  key={item.serviceId}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800 truncate pr-2">
                      {item.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.serviceId)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-800 px-1">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                      >
                        +
                      </button>
                      <span className="text-[10px] text-slate-400">({item.unit})</span>
                    </div>

                    <span className="font-serif font-bold text-slate-900 text-xs">
                      {formatVND(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ExtraServiceModal;
