import React, { useState } from 'react';
import RoomMatrixGrid from '../../components/receptionist/RoomMatrixGrid';
import CleaningStatusModal from '../../components/receptionist/CleaningStatusModal';
import { ROOM_STATUS } from '../../utils/constants';
import { Sparkles, RefreshCw, Filter, Layers } from 'lucide-react';
import Button from '../../components/common/Button';

export const RoomMatrixPage = () => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRoomForCleaning, setSelectedRoomForCleaning] = useState(null);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);

  const [rooms, setRooms] = useState([
    { id: 101, roomNumber: '101', type: 'Standard Twin', status: 'AVAILABLE', floor: 1 },
    { id: 102, roomNumber: '102', type: 'Standard Double', status: 'OCCUPIED', guestName: 'Nguyễn An', floor: 1 },
    { id: 103, roomNumber: '103', type: 'Superior King', status: 'CLEANING', floor: 1 },
    { id: 104, roomNumber: '104', type: 'Superior Ocean', status: 'RESERVED', guestName: 'Trần Bình', floor: 1 },
    { id: 105, roomNumber: '105', type: 'Deluxe View', status: 'AVAILABLE', floor: 1 },
    { id: 106, roomNumber: '106', type: 'Deluxe Balcony', status: 'MAINTENANCE', floor: 1 },
    { id: 201, roomNumber: '201', type: 'Deluxe Suite', status: 'OCCUPIED', guestName: 'Phạm Hoa', floor: 2 },
    { id: 202, roomNumber: '202', type: 'Deluxe Suite', status: 'AVAILABLE', floor: 2 },
    { id: 203, roomNumber: '203', type: 'Premier King', status: 'CLEANING', floor: 2 },
    { id: 204, roomNumber: '204', type: 'President Suite', status: 'OCCUPIED', guestName: 'David Lee', floor: 2 },
  ]);

  const handleOpenCleaningModal = (room) => {
    setSelectedRoomForCleaning(room);
    setIsCleaningModalOpen(true);
  };

  const handleUpdateCleaningStatus = ({ roomId, status }) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status } : r))
    );
  };

  const filteredRooms =
    filterStatus === 'ALL'
      ? rooms
      : rooms.filter((r) => r.status === filterStatus);

  // Statistics
  const total = rooms.length;
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const cleaningCount = rooms.filter((r) => r.status === 'CLEANING').length;
  const reservedCount = rooms.filter((r) => r.status === 'RESERVED').length;

  return (
    <div className="space-y-6">
      {/* Overview Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setFilterStatus('ALL')}
          className={`p-3 rounded-xl border bg-white cursor-pointer transition-all ${
            filterStatus === 'ALL' ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-500 block">Tất cả phòng</span>
          <span className="text-xl font-bold text-slate-900">{total}</span>
        </div>

        <div
          onClick={() => setFilterStatus('AVAILABLE')}
          className={`p-3 rounded-xl border bg-emerald-50/50 cursor-pointer transition-all ${
            filterStatus === 'AVAILABLE' ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-emerald-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-700 block">Sẵn sàng (Trống)</span>
          <span className="text-xl font-bold text-emerald-800">{availableCount}</span>
        </div>

        <div
          onClick={() => setFilterStatus('OCCUPIED')}
          className={`p-3 rounded-xl border bg-rose-50/50 cursor-pointer transition-all ${
            filterStatus === 'OCCUPIED' ? 'border-rose-600 ring-2 ring-rose-500/20' : 'border-rose-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-700 block">Đang ở</span>
          <span className="text-xl font-bold text-rose-800">{occupiedCount}</span>
        </div>

        <div
          onClick={() => setFilterStatus('CLEANING')}
          className={`p-3 rounded-xl border bg-blue-50/50 cursor-pointer transition-all ${
            filterStatus === 'CLEANING' ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-blue-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-blue-700 block">Đang dọn</span>
          <span className="text-xl font-bold text-blue-800">{cleaningCount}</span>
        </div>

        <div
          onClick={() => setFilterStatus('RESERVED')}
          className={`p-3 rounded-xl border bg-amber-50/50 cursor-pointer transition-all ${
            filterStatus === 'RESERVED' ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-amber-200'
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-700 block">Đặt trước</span>
          <span className="text-xl font-bold text-amber-800">{reservedCount}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-blue-600" />
          <span className="text-sm font-bold text-slate-800">
            Sơ đồ phòng trực quan - Đang lọc: {filterStatus}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRooms([...rooms])}
            className="gap-1.5"
          >
            <RefreshCw size={14} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Room Matrix Grid */}
      <RoomMatrixGrid
        rooms={filteredRooms}
        onSelectRoom={handleOpenCleaningModal}
        onUpdateCleaning={handleOpenCleaningModal}
      />

      {/* Housekeeping Cleaning Status Modal ( extend ) */}
      <CleaningStatusModal
        isOpen={isCleaningModalOpen}
        onClose={() => setIsCleaningModalOpen(false)}
        room={selectedRoomForCleaning}
        onConfirm={handleUpdateCleaningStatus}
      />
    </div>
  );
};

export default RoomMatrixPage;
