import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Sparkles, CheckCircle2, AlertTriangle, Hammer } from 'lucide-react';

export const CleaningStatusModal = ({ isOpen, onClose, room, onConfirm }) => {
  const [selectedStatus, setSelectedStatus] = useState('AVAILABLE');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const statuses = [
    {
      code: 'AVAILABLE',
      label: 'Đã dọn sạch - Sẵn sàng đón khách',
      desc: 'Buồng phòng đã kiểm tra đầy đủ tiện nghi, sạch sẽ.',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      code: 'CLEANING',
      label: 'Đang dọn dẹp (Cleaning)',
      desc: 'Nhân viên buồng phòng đang xử lý thay drap, vệ sinh.',
      icon: Sparkles,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      code: 'MAINTENANCE',
      label: 'Cần bảo trì sửa chữa',
      desc: 'Hỏng hóc thiết bị điện, nước hoặc điều hòa cần thợ xử lý.',
      icon: Hammer,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (onConfirm) {
        await onConfirm({ roomId: room?.id, status: selectedStatus, notes });
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cập nhật trạng thái phòng P.${room?.roomNumber || '---'}`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" isLoading={isLoading} onClick={handleSave}>
            Lưu trạng thái
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Chọn trạng thái vệ sinh / vận hành mới cho phòng {room?.roomNumber}:
        </p>

        <div className="space-y-2">
          {statuses.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedStatus === item.code;
            return (
              <div
                key={item.code}
                onClick={() => setSelectedStatus(item.code)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? `${item.color} shadow-xs`
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <Icon size={20} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    {item.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Ghi chú thêm cho bộ phận Buồng phòng
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Cần bổ sung thêm khăn tắm, kiểm tra lại tủ lạnh mini..."
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};

export default CleaningStatusModal;
