import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BedDouble,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const HousekeepingTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [roomCode, setRoomCode] = useState('S803');
  const [taskType, setTaskType] = useState('Dọn trả phòng (Check-out clean)');
  const [priority, setPriority] = useState('URGENT');
  const [staff, setStaff] = useState('Nguyễn Thị Lan (Tổ 1)');
  const [targetTime, setTargetTime] = useState('Trước 14:00');
  const [notes, setNotes] = useState('Khách VIP nhận phòng lúc 14:00, ưu tiên dọn sạch và setup tinh dầu thơm.');

  const availableRooms = [
    { code: 'S803', name: 'Ocean Horizon Suite (Check-out 09:15)', floor: 'Tầng 8' },
    { code: 'P1201', name: 'Grand Celestial Penthouse (Trả phòng hôm nay)', floor: 'Tầng 12' },
    { code: 'V101', name: 'Garden Sanctuary Villa (Khách yêu cầu dọn phòng)', floor: 'Tầng Trệt' },
    { code: 'D0508', name: 'Deluxe Pine Forest View (Bảo trì bóng đèn)', floor: 'Tầng 5' },
  ];

  const staffList = [
    'Nguyễn Thị Lan (Tổ 1 - Phụ trách Suites & Penthouse)',
    'Lê Văn Bình (Tổ 2 - Phụ trách Khu Biệt thự)',
    'Trần Thị Thu (Tổ 1 - Nhân viên buồng phòng)',
    'Phạm Quang Huy (Kỹ thuật viên bảo trì)',
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const matchedRoom = availableRooms.find((r) => r.code === roomCode) || availableRooms[0];

    const newTask = {
      id: `HK-${Math.floor(100 + Math.random() * 900)}`,
      roomCode: matchedRoom.code,
      roomName: matchedRoom.name,
      floor: matchedRoom.floor,
      taskType,
      priority,
      priorityLabel: priority === 'URGENT' ? 'Ưu tiên khẩn cấp' : 'Bình thường',
      staff,
      targetTime,
      status: 'IN_PROGRESS',
      statusLabel: 'Đang dọn dẹp',
      notes,
    };

    if (onAddTask) {
      onAddTask(newTask);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="space-y-0.5">
            <h3 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
              <Sparkles size={18} className="text-[#C59D5F]" />
              <span>Phân công & Điều phối Buồng phòng (Housekeeping)</span>
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Tạo yêu cầu dọn phòng, bàn giao nhân sự và theo dõi tiến độ hoàn tất.
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* 1. Chọn phòng cần dọn */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800 flex items-center gap-1.5">
              <BedDouble size={14} className="text-[#C59D5F]" />
              <span>Phòng cần xử lý vệ sinh / bảo trì *</span>
            </label>
            <select
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 font-semibold focus:outline-none focus:border-stone-400"
            >
              {availableRooms.map((r) => (
                <option key={r.code} value={r.code}>
                  Phòng {r.code} — {r.name} ({r.floor})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Loại hình dọn dẹp & Mức độ ưu tiên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-800">Quy trình dọn dẹp *</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-400"
              >
                <option value="Dọn trả phòng (Check-out clean)">Dọn trả phòng (Check-out clean)</option>
                <option value="Dọn phòng lưu trú (Stayover make-up)">Dọn phòng lưu trú (Stayover make-up)</option>
                <option value="Bảo trì thiết bị (Maintenance)">Bảo trì thiết bị (Maintenance)</option>
                <option value="Khử khuẩn chuyên sâu (Deep sanitizing)">Khử khuẩn chuyên sâu (Deep sanitizing)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-800">Mức độ ưu tiên *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 font-bold focus:outline-none focus:border-stone-400"
              >
                <option value="URGENT">🔴 Ưu tiên khẩn cấp (Khách nhận phòng sớm)</option>
                <option value="HIGH">🟡 Ưu tiên cao (Trước 14:00)</option>
                <option value="NORMAL">🟢 Bình thường</option>
              </select>
            </div>
          </div>

          {/* 3. Phân công nhân sự & Thời gian hoàn thành */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-stone-800 flex items-center gap-1.5">
                <User size={13} className="text-[#C59D5F]" />
                <span>Nhân viên buồng phòng phụ trách</span>
              </label>
              <select
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-400"
              >
                {staffList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Clock size={13} className="text-[#C59D5F]" />
                <span>Hạn chót hoàn tất (Target time)</span>
              </label>
              <input
                type="text"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                placeholder="Ví dụ: Trước 13:30"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800">
              Yêu cầu đặc biệt cho buồng phòng
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Yêu cầu thay ga giường lụa, bổ sung gối, kiểm tra lại bồn ngâm Jacuzzi..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-stone-400 resize-none"
            />
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-stone-200 hover:bg-stone-100 text-stone-600 font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white font-semibold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              <span>Phân công & Gửi yêu cầu dọn phòng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HousekeepingTaskModal;
