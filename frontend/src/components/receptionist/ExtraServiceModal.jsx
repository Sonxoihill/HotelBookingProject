import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatVND } from '../../utils/formatters';
import { Plus, Trash2, Coffee, Shirt, Car, Utensils } from 'lucide-react';

export const ExtraServiceModal = ({ isOpen, onClose, booking, onSave }) => {
  const availableServices = [
    { id: 1, name: 'Nước suối khoáng (Minibar)', price: 20000, category: 'Minibar', icon: Coffee },
    { id: 2, name: 'Bia Heineken (Minibar)', price: 45000, category: 'Minibar', icon: Coffee },
    { id: 3, name: 'Giặt ủi quần áo theo kg', price: 60000, category: 'Giặt ủi', icon: Shirt },
    { id: 4, name: 'Bữa sáng Buffet phát sinh', price: 150000, category: 'Ẩm thực', icon: Utensils },
    { id: 5, name: 'Thuê xe máy tự lái (1 ngày)', price: 180000, category: 'Phương tiện', icon: Car },
  ];

  const [selectedItems, setSelectedItems] = useState([
    { serviceId: 1, name: 'Nước suối khoáng (Minibar)', quantity: 2, price: 20000 },
  ]);

  const addItem = (svc) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.serviceId === svc.id);
      if (existing) {
        return prev.map((item) =>
          item.serviceId === svc.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { serviceId: svc.id, name: svc.name, quantity: 1, price: svc.price }];
    });
  };

  const removeItem = (serviceId) => {
    setSelectedItems((prev) => prev.filter((item) => item.serviceId !== serviceId));
  };

  const totalExtra = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Thêm Dịch vụ phát sinh - Đơn #${booking?.id || 'BK-1082'}`}
      maxWidth="max-w-2xl"
      footer={
        <>
          <div className="mr-auto text-xs text-slate-500">
            Tổng cộng thêm: <span className="text-base font-bold text-blue-600">{formatVND(totalExtra)}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (onSave) onSave({ bookingId: booking?.id, items: selectedItems, totalExtra });
              onClose();
            }}
          >
            Lưu vào hóa đơn
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Danh mục dịch vụ chọn nhanh */}
        <div className="space-y-2 border-r border-slate-100 pr-2">
          <span className="text-xs font-bold text-slate-700 block">Danh mục dịch vụ khả dụng</span>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {availableServices.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-blue-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{svc.name}</p>
                      <span className="text-[10px] text-slate-400">{formatVND(svc.price)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addItem(svc)}
                    className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Danh sách đã chọn */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Dịch vụ đã gán vào đơn</span>
          {selectedItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có dịch vụ phát sinh nào.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <div
                  key={item.serviceId}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                    <span className="text-[10px] text-slate-500">
                      {formatVND(item.price)} × {item.quantity} = <strong className="text-slate-700">{formatVND(item.price * item.quantity)}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.serviceId)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
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
