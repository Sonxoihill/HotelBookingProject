import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Sparkles, CheckCircle2, AlertTriangle, Hammer, Clock, User } from 'lucide-react';
import { ROOM_STATUS } from '../../utils/constants';
import roomService from '../../services/roomService';

export const CleaningStatusModal = ({ isOpen, onClose, room, onConfirmClean, onConfirm }) => {
  const [selectedStatus, setSelectedStatus] = useState('AVAILABLE');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!room) return null;

  const roomCode = room.roomCode || room.roomNumber || '---';
  const roomId = room.id || roomCode;
  const currentStatus = room.status || 'DIRTY';
  const statusMeta = ROOM_STATUS[currentStatus] || ROOM_STATUS.DIRTY;

  // Xử lý xác nhận đã dọn xong phòng -> Gọi PATCH /api/v1/receptionist/rooms/{roomId}/clean
  const handleConfirmClean = async () => {
    setIsLoading(true);
    try {
      if (onConfirmClean) {
        await onConfirmClean(room);
      } else {
        await roomService.cleanRoom(roomId);
        if (onConfirm) {
          await onConfirm({ roomId, status: 'AVAILABLE', notes });
        }
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi xác nhận dọn phòng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomStatusSave = async () => {
    setIsLoading(true);
    try {
      if (selectedStatus === 'AVAILABLE') {
        if (onConfirmClean) {
          await onConfirmClean(room);
        } else {
          await roomService.cleanRoom(roomId);
          if (onConfirm) {
            await onConfirm({ roomId, status: selectedStatus, notes });
          }
        }
      } else {
        if (onConfirm) {
          await onConfirm({ roomId, status: selectedStatus, notes });
        }
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu trạng thái buồng phòng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    {
      code: 'AVAILABLE',
      label: 'Đã dọn sạch - Trống sẵn sàng',
      desc: 'Buồng phòng đã kiểm tra đầy đủ tiện nghi, sạch sẽ 5 sao.',
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    },
    {
      code: 'DIRTY',
      label: 'Cần dọn (Chưa xử lý xong)',
      desc: 'Phòng vẫn đang chờ hoặc chưa hoàn tất quy trình vệ sinh.',
      icon: Sparkles,
      color: 'text-amber-800 bg-[#FDF4E7] border-amber-300',
    },
    {
      code: 'MAINTENANCE',
      label: 'Chuyển sang Bảo trì sửa chữa',
      desc: 'Phát hiện hỏng hóc thiết bị, công tắc, điều hòa cần thợ xử lý.',
      icon: Hammer,
      color: 'text-stone-700 bg-stone-100 border-stone-300',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Xử lý dọn phòng • P.${roomCode}`}
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            {currentStatus === 'DIRTY' ? (
              <Button
                variant="emerald"
                size="sm"
                isLoading={isLoading}
                onClick={handleConfirmClean}
                className="font-bold shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>Xác nhận đã dọn xong</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                isLoading={isLoading}
                onClick={handleCustomStatusSave}
              >
                Lưu thay đổi
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Card 1: Thông tin phòng & Trạng thái hiện tại */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold text-stone-900">
                  Phòng {roomCode}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {room.floor || 'Tầng ---'}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                {room.roomName || room.name || room.category || 'Phòng nghỉ cao cấp'}
              </p>
            </div>

            {/* Current Status Pill */}
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-1">
                Trạng thái hiện tại
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badge}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
                <span>{statusMeta.label}</span>
              </span>
            </div>
          </div>

          {/* Quick details */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/70 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600">
              <Clock size={13} className="text-stone-400 shrink-0" />
              <span>Hạn chót: {room.targetTime || room.checkOutDate || 'Trước 14:00'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <User size={13} className="text-[#C59D5F] shrink-0" />
              <span className="truncate">Nhân sự: {room.staff || 'Tổ buồng phòng'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: DIRTY Action Banner */}
        {currentStatus === 'DIRTY' && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="flex-1 text-xs">
              <p className="font-bold text-amber-900">
                Phòng đang ở trạng thái CẦN DỌN (DIRTY)
              </p>
              <p className="text-amber-800/90 mt-1 leading-relaxed">
                {room.notes || room.specialNotes || 'Phòng sau khi khách trả phòng hoặc cần vệ sinh định kỳ. Vui lòng kiểm tra tiêu chuẩn vệ sinh, drap gối và đồ dùng trước khi xác nhận.'}
              </p>
            </div>
          </div>
        )}

        {/* Card 3: Nút Xác nhận đã dọn xong nổi bật */}
        {currentStatus === 'DIRTY' && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                Nghiệm thu buồng phòng
              </span>
              <span className="text-[11px] text-emerald-700 block">
                Chuyển trạng thái phòng sang <strong>Trống (AVAILABLE)</strong> tức thời.
              </span>
            </div>
            <Button
              variant="emerald"
              size="sm"
              isLoading={isLoading}
              onClick={handleConfirmClean}
              className="font-bold shadow-xs whitespace-nowrap cursor-pointer"
            >
              <CheckCircle2 size={15} className="mr-1" />
              Xác nhận đã dọn xong
            </Button>
          </div>
        )}

        {/* Tùy chọn chuyển trạng thái khác nếu cần */}
        <div className="pt-1">
          <label className="text-xs font-semibold text-stone-700 block mb-2">
            Hoặc cập nhật trạng thái khác:
          </label>
          <div className="space-y-2">
            {statusOptions.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedStatus === item.code;
              return (
                <div
                  key={item.code}
                  onClick={() => setSelectedStatus(item.code)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? `${item.color} shadow-xs font-medium`
                      : 'border-stone-100 hover:border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <Icon size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[11px] opacity-80 leading-tight block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ghi chú thêm */}
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">
            Ghi chú bộ phận Buồng phòng (nếu có)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Đã thay bộ drap mới, bổ sung 02 khăn tắm và nước khoáng..."
            className="w-full text-xs border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:border-stone-400 resize-none shadow-2xs"
          />
        </div>
      </div>
    </Modal>
  );
};

export default CleaningStatusModal;
