import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Clock,
  User,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import HousekeepingTaskModal from '../../components/receptionist/HousekeepingTaskModal';
import CleaningStatusModal from '../../components/receptionist/CleaningStatusModal';
import roomService from '../../services/roomService';

const INITIAL_HOUSEKEEPING_TASKS = [
  {
    id: 'HK-101',
    roomId: 'S803',
    roomCode: 'S803',
    roomNumber: 'S803',
    roomName: 'Ocean Horizon Suite S803',
    floor: 'Tầng 8',
    taskType: 'Dọn trả phòng (Check-out clean)',
    priority: 'URGENT',
    priorityLabel: 'Ưu tiên khẩn cấp',
    staff: 'Nguyễn Thị Lan (Tổ 1)',
    targetTime: 'Trước 14:00',
    status: 'DIRTY',
    statusLabel: 'Cần dọn',
    statusVariant: 'amber',
    notes: 'Khách VIP nhận phòng lúc 14:00, ưu tiên dọn sạch và setup tinh dầu thơm.',
  },
  {
    id: 'HK-102',
    roomId: 'P1201',
    roomCode: 'P1201',
    roomNumber: 'P1201',
    roomName: 'Grand Celestial Penthouse',
    floor: 'Tầng 12',
    taskType: 'Dọn phòng lưu trú (Stayover make-up)',
    priority: 'HIGH',
    priorityLabel: 'Ưu tiên cao',
    staff: 'Lê Văn Bình (Tổ 2)',
    targetTime: 'Trước 12:30',
    status: 'IN_PROGRESS',
    statusLabel: 'Đang dọn dẹp',
    statusVariant: 'blue',
    notes: 'Khách Đỗ Minh Quân yêu cầu bổ sung 02 gối lông ngỗng mềm.',
  },
  {
    id: 'HK-103',
    roomId: 'V104',
    roomCode: 'V104',
    roomNumber: 'V104',
    roomName: 'Garden Sanctuary Villa V104',
    floor: 'Tầng Trệt',
    taskType: 'Dọn trả phòng biệt thự (Villa clean)',
    priority: 'HIGH',
    priorityLabel: 'Ưu tiên cao',
    staff: 'Trần Thị Thu (Tổ 1)',
    targetTime: 'Trước 15:30',
    status: 'DIRTY',
    statusLabel: 'Cần dọn',
    statusVariant: 'amber',
    notes: 'Khách vừa checkout lúc 11:30, cần thay toàn bộ drap gối và dọn hồ bơi ngoài trời.',
  },
  {
    id: 'HK-104',
    roomId: 'D0508',
    roomCode: 'D0508',
    roomNumber: 'D0508',
    roomName: 'Deluxe Pine Forest View',
    floor: 'Tầng 5',
    taskType: 'Bảo trì thiết bị (Maintenance)',
    priority: 'HIGH',
    priorityLabel: 'Cần bảo trì',
    staff: 'Phạm Quang Huy (Kỹ thuật)',
    targetTime: 'Trước 15:00',
    status: 'MAINTENANCE',
    statusLabel: 'Bảo trì',
    statusVariant: 'stone',
    notes: 'Kiểm tra bảo dưỡng điều hòa 2 chiều và công tắc đèn ban công.',
  },
  {
    id: 'HK-105',
    roomId: 'P1204',
    roomCode: 'P1204',
    roomNumber: 'P1204',
    roomName: 'Lunar Summit Penthouse',
    floor: 'Tầng 12',
    taskType: 'Khử khuẩn chuyên sâu (Deep clean)',
    priority: 'NORMAL',
    priorityLabel: 'Đã kiểm định',
    staff: 'Nguyễn Thị Lan (Tổ 1)',
    targetTime: 'Đã hoàn tất',
    status: 'AVAILABLE',
    statusLabel: 'Trống (Sẵn sàng)',
    statusVariant: 'emerald',
    notes: 'Giám sát viên HK đã ký duyệt nghiệm thu đạt chuẩn 5 sao, sẵn sàng đón khách.',
  },
];

export const HousekeepingManagementPage = () => {
  const [tasks, setTasks] = useState(INITIAL_HOUSEKEEPING_TASKS);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
  const [selectedRoomForClean, setSelectedRoomForClean] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAddTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Đã phân công thành công phòng ${newTask.roomCode} cho ${newTask.staff}!`);
  };

  // Cập nhật trạng thái Task đơn thuần
  const handleUpdateStatus = (taskId, newStatus, newLabel, variant) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: newStatus, statusLabel: newLabel, statusVariant: variant }
          : t
      )
    );
    showToast(`Đã cập nhật trạng thái Task #${taskId} sang: ${newLabel}`);
  };

  // Mở popup xử lý dọn phòng khi click vào phòng có trạng thái DIRTY (Theo yêu cầu Plase 1)
  const handleOpenCleanModal = (taskOrRoom) => {
    setSelectedRoomForClean({
      id: taskOrRoom.roomId || taskOrRoom.roomCode || taskOrRoom.id,
      roomCode: taskOrRoom.roomCode,
      roomNumber: taskOrRoom.roomCode,
      floor: taskOrRoom.floor,
      roomName: taskOrRoom.roomName,
      status: taskOrRoom.status,
      notes: taskOrRoom.notes,
      staff: taskOrRoom.staff,
      targetTime: taskOrRoom.targetTime,
    });
    setIsCleaningModalOpen(true);
  };

  // Xác nhận đã dọn xong: Gọi API PATCH /api/v1/receptionist/rooms/{roomId}/clean và cập nhật State về AVAILABLE ngay lập tức
  const handleConfirmClean = async (roomId) => {
    const targetRoomId = roomId || selectedRoomForClean?.id;
    if (!targetRoomId) return;

    try {
      // Gọi API PATCH /api/v1/receptionist/rooms/{roomId}/clean
      await roomService.cleanRoom(targetRoomId);
    } catch (error) {
      console.warn('API PATCH /api/v1/receptionist/rooms/' + targetRoomId + '/clean (Chưa có backend):', error);
    }

    // Cập nhật State danh sách phòng về AVAILABLE ngay lập tức (AC: phản ánh tức thời không cần reload trang)
    setTasks((prev) =>
      prev.map((t) =>
        t.roomId === targetRoomId || t.roomCode === targetRoomId || t.id === targetRoomId
          ? {
              ...t,
              status: 'AVAILABLE',
              statusLabel: 'Trống (Sẵn sàng)',
              statusVariant: 'emerald',
              notes: 'Buồng phòng đã nghiệm thu sạch sẽ đạt chuẩn 5 sao, sẵn sàng đón khách.',
              targetTime: 'Đã hoàn tất',
            }
          : t
      )
    );

    showToast(`Phòng ${targetRoomId} đã được dọn xong và cập nhật trạng thái về AVAILABLE ngay lập tức!`);
    setIsCleaningModalOpen(false);
  };

  // Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'Cần dọn' && task.status !== 'DIRTY') return false;
      if (activeTab === 'Đang dọn' && task.status !== 'IN_PROGRESS') return false;
      if (activeTab === 'Chờ duyệt HK' && task.status !== 'INSPECTING') return false;
      if (activeTab === 'Đã hoàn tất' && task.status !== 'AVAILABLE') return false;
      if (activeTab === 'Cần bảo trì' && task.status !== 'MAINTENANCE') return false;

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchRoom = (task.roomCode || '').toLowerCase().includes(term);
        const matchName = (task.roomName || '').toLowerCase().includes(term);
        const matchStaff = (task.staff || '').toLowerCase().includes(term);
        const matchId = (task.id || '').toLowerCase().includes(term);
        if (!matchRoom && !matchName && !matchStaff && !matchId) return false;
      }

      return true;
    });
  }, [tasks, activeTab, searchTerm]);

  // Statistics
  const dirtyCount = tasks.filter((t) => t.status === 'DIRTY').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const availableCount = tasks.filter((t) => t.status === 'AVAILABLE').length;
  const maintenanceCount = tasks.filter((t) => t.status === 'MAINTENANCE').length;

  // Danh sách các phòng đang DIRTY để hiển thị Quick Access
  const dirtyRooms = useMemo(() => {
    return tasks.filter((t) => t.status === 'DIRTY');
  }, [tasks]);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto min-h-full flex flex-col justify-between select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 p-4 bg-stone-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
              Quản lý Buồng phòng (Housekeeping)
            </h1>
            <p className="text-xs text-stone-500 font-light mt-1">
              Theo dõi tiến độ làm phòng, phân công nhân sự và xác nhận buồng phòng sạch sẽ chuẩn 5 sao.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => showToast('Đang tạo báo cáo tổng hợp chất lượng buồng phòng ca sáng...')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-400 text-xs font-semibold text-stone-800 transition-colors cursor-pointer shadow-2xs"
            >
              <FileCheck size={15} />
              <span>Báo cáo tình trạng phòng</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>+ Báo dọn phòng khẩn cấp</span>
            </button>
          </div>
        </div>

        {/* 2. Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng số phòng cần xử lý */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-stone-400 uppercase block">
              Tổng Task buồng phòng
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {tasks.length}
              </span>
              <span className="text-xs text-stone-500 font-light">hôm nay</span>
            </div>
          </div>

          {/* Card 2: DIRTY -> Cần dọn (Màu Vàng) */}
          <div
            onClick={() => setActiveTab(activeTab === 'Cần dọn' ? 'Tất cả' : 'Cần dọn')}
            className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-1 cursor-pointer transition-all ${
              activeTab === 'Cần dọn' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-stone-200/90 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-amber-800 uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Cần dọn (DIRTY)</span>
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {dirtyCount}
              </span>
              <span className="text-xs text-amber-800 font-medium">chờ nghiệm thu</span>
            </div>
          </div>

          {/* Card 3: Đang dọn dẹp */}
          <div
            onClick={() => setActiveTab(activeTab === 'Đang dọn' ? 'Tất cả' : 'Đang dọn')}
            className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-1 cursor-pointer transition-all ${
              activeTab === 'Đang dọn' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-stone-200/90 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Đang dọn dẹp</span>
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {inProgressCount}
              </span>
              <span className="text-xs text-blue-600 font-medium">nhân viên đang xử lý</span>
            </div>
          </div>

          {/* Card 4: AVAILABLE -> Sẵn sàng đón khách (Màu Xanh lá) */}
          <div
            onClick={() => setActiveTab(activeTab === 'Đã hoàn tất' ? 'Tất cả' : 'Đã hoàn tất')}
            className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-1 cursor-pointer transition-all ${
              activeTab === 'Đã hoàn tất' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-stone-200/90 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Trống sẵn sàng (AVAILABLE)</span>
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {availableCount}
              </span>
              <span className="text-xs text-emerald-600 font-medium">đã sạch sẽ</span>
            </div>
          </div>
        </div>

        {/* 3. Quick Action Banner: Danh sách phòng DIRTY (Click để mở popup nghiệm thu) */}
        {dirtyRooms.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#FDF4E7] border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Có {dirtyRooms.length} phòng đang ở trạng thái CẦN DỌN (DIRTY)
                </span>
                <span className="text-[11px] text-amber-900/80 block">
                  Click vào phòng bên dưới để xem thông tin chi tiết và bấm "Xác nhận đã dọn xong":
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {dirtyRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleOpenCleanModal(room)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:scale-[1.02]"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>P.{room.roomCode}</span>
                  <span className="text-[10px] font-normal text-amber-700">({room.floor})</span>
                  <ArrowRight size={12} className="text-amber-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'Tất cả', label: `Tất cả task (${tasks.length})` },
              { id: 'Cần dọn', label: `Cần dọn (${dirtyCount})` },
              { id: 'Đang dọn', label: `Đang dọn (${inProgressCount})` },
              { id: 'Đã hoàn tất', label: `Trống sẵn sàng (${availableCount})` },
              { id: 'Cần bảo trì', label: `Bảo trì (${maintenanceCount})` },
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
              placeholder="Tìm số phòng, nhân sự..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400 shadow-2xs"
            />
          </div>
        </div>

        {/* 5. Housekeeping Tasks Data Table */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Mã Task & Phòng</th>
                  <th className="py-4 px-6">Quy trình dọn dẹp</th>
                  <th className="py-4 px-6">Mức độ ưu tiên</th>
                  <th className="py-4 px-6">Nhân sự phụ trách</th>
                  <th className="py-4 px-6">Hạn chót</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-stone-400 text-xs">
                      Không có task buồng phòng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const isDirty = t.status === 'DIRTY';

                    return (
                      <tr
                        key={t.id}
                        onClick={() => {
                          if (isDirty) handleOpenCleanModal(t);
                        }}
                        className={`transition-colors ${
                          isDirty ? 'hover:bg-amber-50/40 cursor-pointer' : 'hover:bg-stone-50/70'
                        }`}
                      >
                        {/* Mã Task & Phòng */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-base text-stone-900">
                              {t.roomCode}
                            </span>
                            <span className="text-stone-400 text-[11px]">•</span>
                            <span className="text-stone-500 font-medium text-xs">
                              {t.floor}
                            </span>
                            {isDirty && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                                Click để nghiệm thu
                              </span>
                            )}
                          </div>
                          <span className="text-stone-400 text-[11px] block font-light">
                            #{t.id} - {t.roomName}
                          </span>
                        </td>

                        {/* Quy trình dọn dẹp */}
                        <td className="py-4 px-6">
                          <span className="font-semibold text-stone-800 block">
                            {t.taskType}
                          </span>
                          {t.notes && (
                            <p className="text-[11px] text-stone-400 italic line-clamp-1 mt-0.5">
                              {t.notes}
                            </p>
                          )}
                        </td>

                        {/* Mức độ ưu tiên */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === 'URGENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : t.priority === 'HIGH'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            <span>{t.priorityLabel}</span>
                          </span>
                        </td>

                        {/* Nhân sự phụ trách */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-[#C59D5F] shrink-0" />
                            <span className="font-medium text-stone-800">{t.staff}</span>
                          </div>
                        </td>

                        {/* Hạn chót */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 text-stone-600 font-mono">
                            <Clock size={12} className="text-stone-400" />
                            <span>{t.targetTime}</span>
                          </div>
                        </td>

                        {/* Trạng thái chuẩn Enum Backend */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                              t.status === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : t.status === 'DIRTY'
                                ? 'bg-[#FDF4E7] text-amber-800 border-amber-300'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : t.status === 'MAINTENANCE'
                                ? 'bg-stone-100 text-stone-700 border-stone-200'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.status === 'AVAILABLE'
                                  ? 'bg-emerald-500'
                                  : t.status === 'DIRTY'
                                  ? 'bg-amber-500'
                                  : t.status === 'IN_PROGRESS'
                                  ? 'bg-blue-500'
                                  : 'bg-stone-400'
                              }`}
                            ></span>
                            <span>{t.statusLabel}</span>
                          </span>
                        </td>

                        {/* Thao tác xử lý */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Nút dọn xong khi phòng DIRTY (Theo yêu cầu Plase 1) */}
                            {t.status === 'DIRTY' && (
                              <button
                                type="button"
                                onClick={() => handleOpenCleanModal(t)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                              >
                                <CheckCircle2 size={13} />
                                <span>Xác nhận đã dọn xong</span>
                              </button>
                            )}

                            {t.status === 'IN_PROGRESS' && (
                              <button
                                type="button"
                                onClick={() => handleConfirmClean(t.roomCode)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <CheckCircle2 size={13} />
                                <span>Hoàn tất dọn</span>
                              </button>
                            )}

                            {t.status === 'AVAILABLE' && (
                              <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                                <ShieldCheck size={14} />
                                <span>Sẵn sàng đón khách</span>
                              </span>
                            )}

                            {t.status === 'MAINTENANCE' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateStatus(t.id, 'DIRTY', 'Cần dọn', 'amber')
                                }
                                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Xong bảo trì
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination & count */}
          <div className="p-4 sm:px-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Hiển thị 1 - {filteredTasks.length} trên {tasks.length} task buồng phòng</span>

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

      {/* 6. Footer */}
      <div className="pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2 select-none">
        <p>© 2025 L'Étoile Luxury Retreat</p>
        <p>Hệ thống Front Desk • Phân hệ Quản lý Buồng phòng (Housekeeping PMS)</p>
      </div>

      {/* Housekeeping Task Modal */}
      <HousekeepingTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      {/* Cleaning Status Modal: Khi click vào phòng DIRTY hiển thị thông tin và nút Xác nhận đã dọn xong */}
      <CleaningStatusModal
        isOpen={isCleaningModalOpen}
        onClose={() => setIsCleaningModalOpen(false)}
        room={selectedRoomForClean}
        onConfirmClean={handleConfirmClean}
      />
    </div>
  );
};

export default HousekeepingManagementPage;
