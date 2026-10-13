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
  AlertTriangle,
  Check,
  ShieldCheck,
} from 'lucide-react';
import HousekeepingTaskModal from '../../components/receptionist/HousekeepingTaskModal';

const INITIAL_HOUSEKEEPING_TASKS = [
  {
    id: 'HK-101',
    roomCode: 'S803',
    roomName: 'Ocean Horizon Suite S803',
    floor: 'Tầng 8',
    taskType: 'Dọn trả phòng (Check-out clean)',
    priority: 'URGENT',
    priorityLabel: 'Ưu tiên khẩn cấp',
    staff: 'Nguyễn Thị Lan (Tổ 1)',
    targetTime: 'Trước 14:00',
    status: 'IN_PROGRESS',
    statusLabel: 'Đang dọn dẹp',
    statusVariant: 'blue',
    notes: 'Khách VIP nhận phòng lúc 14:00, ưu tiên dọn sạch và setup tinh dầu thơm.',
  },
  {
    id: 'HK-102',
    roomCode: 'P1201',
    roomName: 'Grand Celestial Penthouse',
    floor: 'Tầng 12',
    taskType: 'Dọn phòng lưu trú (Stayover make-up)',
    priority: 'HIGH',
    priorityLabel: 'Ưu tiên cao',
    staff: 'Lê Văn Bình (Tổ 2)',
    targetTime: 'Trước 12:30',
    status: 'INSPECTING',
    statusLabel: 'Chờ duyệt HK',
    statusVariant: 'amber',
    notes: 'Khách Đỗ Minh Quân yêu cầu bổ sung 02 gối lông ngỗng mềm.',
  },
  {
    id: 'HK-103',
    roomCode: 'V101',
    roomName: 'Garden Sanctuary Villa V101',
    floor: 'Tầng Trệt',
    taskType: 'Dọn phòng lưu trú (Stayover make-up)',
    priority: 'NORMAL',
    priorityLabel: 'Bình thường',
    staff: 'Trần Thị Thu (Tổ 1)',
    targetTime: 'Trước 16:00',
    status: 'PENDING',
    statusLabel: 'Chờ dọn',
    statusVariant: 'slate',
    notes: 'Dọn dẹp sau tiệc trà chiều tại khu vườn biệt thự.',
  },
  {
    id: 'HK-104',
    roomCode: 'D0508',
    roomName: 'Deluxe Pine Forest View',
    floor: 'Tầng 5',
    taskType: 'Bảo trì thiết bị (Maintenance)',
    priority: 'HIGH',
    priorityLabel: 'Cần bảo trì',
    staff: 'Phạm Quang Huy (Kỹ thuật)',
    targetTime: 'Trước 15:00',
    status: 'MAINTENANCE',
    statusLabel: 'Đang bảo trì',
    statusVariant: 'rose',
    notes: 'Kiểm tra bảo dưỡng điều hòa 2 chiều và công tắc đèn ban công.',
  },
  {
    id: 'HK-105',
    roomCode: 'P1204',
    roomName: 'Lunar Summit Penthouse',
    floor: 'Tầng 12',
    taskType: 'Khử khuẩn chuyên sâu (Deep clean)',
    priority: 'NORMAL',
    priorityLabel: 'Đã kiểm định',
    staff: 'Nguyễn Thị Lan (Tổ 1)',
    targetTime: 'Đã hoàn tất',
    status: 'COMPLETED',
    statusLabel: 'Đã kiểm định sạch',
    statusVariant: 'emerald',
    notes: 'Giám sát viên HK đã ký duyệt nghiệm thu đạt chuẩn 5 sao.',
  },
];

export const HousekeepingManagementPage = () => {
  const [tasks, setTasks] = useState(INITIAL_HOUSEKEEPING_TASKS);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAddTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Đã phân công thành công phòng ${newTask.roomCode} cho ${newTask.staff}!`);
  };

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

  // Filter logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'Cần dọn' && task.status !== 'PENDING') return false;
      if (activeTab === 'Đang dọn' && task.status !== 'IN_PROGRESS') return false;
      if (activeTab === 'Chờ duyệt HK' && task.status !== 'INSPECTING') return false;
      if (activeTab === 'Đã hoàn tất' && task.status !== 'COMPLETED') return false;
      if (activeTab === 'Cần bảo trì' && task.status !== 'MAINTENANCE') return false;

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchRoom = task.roomCode.toLowerCase().includes(term);
        const matchName = task.roomName.toLowerCase().includes(term);
        const matchStaff = task.staff.toLowerCase().includes(term);
        const matchId = task.id.toLowerCase().includes(term);
        if (!matchRoom && !matchName && !matchStaff && !matchId) return false;
      }

      return true;
    });
  }, [tasks, activeTab, searchTerm]);

  // Statistics
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inspectingCount = tasks.filter((t) => t.status === 'INSPECTING').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

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
              Quản lý Buồng phòng (Housekeeping)
            </h1>
            <p className="text-xs text-stone-500 font-light mt-1">
              Theo dõi tiến độ làm phòng, phân công nhân sự và kiểm định chất lượng vệ sinh chuẩn 5 sao.
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
              Tổng phòng cần xử lý
            </span>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {tasks.length}
              </span>
              <span className="text-xs text-stone-500 font-light">hôm nay</span>
            </div>
          </div>

          {/* Card 2: Đang dọn dẹp */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
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

          {/* Card 3: Chờ kiểm định HK */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-amber-600 uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Chờ kiểm định HK</span>
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {inspectingCount}
              </span>
              <span className="text-xs text-amber-700 font-medium">giám sát cần duyệt</span>
            </div>
          </div>

          {/* Card 4: Đã hoàn tất & Sạch sẽ */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Đã hoàn tất sạch sẽ</span>
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-serif text-3xl font-bold text-stone-900">
                {completedCount + 28}
              </span>
              <span className="text-xs text-emerald-600 font-medium">sẵn sàng đón khách</span>
            </div>
          </div>
        </div>

        {/* 3. Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'Tất cả', label: `Tất cả task (${tasks.length})` },
              { id: 'Cần dọn', label: `Cần dọn (${pendingCount})` },
              { id: 'Đang dọn', label: `Đang dọn (${inProgressCount})` },
              { id: 'Chờ duyệt HK', label: `Chờ duyệt HK (${inspectingCount})` },
              { id: 'Đã hoàn tất', label: 'Đã hoàn tất' },
              { id: 'Cần bảo trì', label: 'Cần bảo trì' },
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

        {/* 4. Housekeeping Tasks Data Table */}
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
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/70 transition-colors">
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

                    {/* Trạng thái */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium ${
                          t.statusVariant === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : t.statusVariant === 'blue'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : t.statusVariant === 'amber'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : t.statusVariant === 'rose'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.statusVariant === 'emerald'
                              ? 'bg-emerald-500'
                              : t.statusVariant === 'blue'
                              ? 'bg-blue-500'
                              : t.statusVariant === 'amber'
                              ? 'bg-amber-500'
                              : t.statusVariant === 'rose'
                              ? 'bg-rose-500'
                              : 'bg-stone-500'
                          }`}
                        ></span>
                        <span>{t.statusLabel}</span>
                      </span>
                    </td>

                    {/* Thao tác xử lý */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        {t.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(t.id, 'IN_PROGRESS', 'Đang dọn dẹp', 'blue')
                            }
                            className="px-3 py-1.5 rounded-lg bg-black hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            Bắt đầu dọn
                          </button>
                        )}

                        {t.status === 'IN_PROGRESS' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(t.id, 'INSPECTING', 'Chờ duyệt HK', 'amber')
                            }
                            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Báo đã dọn xong
                          </button>
                        )}

                        {t.status === 'INSPECTING' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(t.id, 'COMPLETED', 'Đã kiểm định sạch', 'emerald')
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Check size={13} />
                            <span>Duyệt nghiệm thu</span>
                          </button>
                        )}

                        {t.status === 'COMPLETED' && (
                          <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                            <ShieldCheck size={14} />
                            <span>Sẵn sàng đón khách</span>
                          </span>
                        )}

                        {t.status === 'MAINTENANCE' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(t.id, 'PENDING', 'Chờ dọn dẹp', 'slate')
                            }
                            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Xong bảo trì
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* 5. Footer */}
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
    </div>
  );
};

export default HousekeepingManagementPage;
