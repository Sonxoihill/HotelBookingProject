import React, { useMemo } from 'react';
import { ROOM_STATUS } from '../../utils/constants';
import { User, Sparkles, Building2 } from 'lucide-react';

export const RoomMatrixGrid = ({ rooms = [], onSelectRoom, onUpdateCleaning }) => {
  // Nhóm danh sách phòng theo tầng dựa trên chữ số đầu tiên của số phòng (e.g. 101 -> Tầng 1, 201 -> Tầng 2)
  const roomsByFloor = useMemo(() => {
    const groups = {};
    rooms.forEach((room) => {
      const roomNumStr = String(room.roomNumber || '');
      const floor = roomNumStr.charAt(0) || String(room.floor || '1');
      if (!groups[floor]) {
        groups[floor] = [];
      }
      groups[floor].push(room);
    });

    // Sắp xếp các tầng theo thứ tự tăng dần
    return Object.keys(groups)
      .sort((a, b) => Number(a) - Number(b))
      .map((floor) => ({
        floor,
        rooms: groups[floor],
      }));
  }, [rooms]);

  if (rooms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
        <Building2 size={36} className="mx-auto text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">
          Không có phòng nào phù hợp với bộ lọc hiện tại
        </p>
        <p className="text-xs text-slate-400">
          Vui lòng thử chọn trạng thái hoặc tầng khác.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {roomsByFloor.map(({ floor, rooms: floorRooms }) => {
        const availableCount = floorRooms.filter((r) => r.status === 'AVAILABLE').length;
        const occupiedCount = floorRooms.filter((r) => r.status === 'OCCUPIED').length;
        const cleaningCount = floorRooms.filter((r) => r.status === 'CLEANING').length;

        return (
          <div
            key={floor}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4"
          >
            {/* Floor Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-sm border border-blue-200/60 shadow-2xs">
                  {floor}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>Tầng {floor}</span>
                    <span className="text-xs font-semibold text-slate-400 font-sans">
                      ({floorRooms.length} phòng)
                    </span>
                  </h3>
                </div>
              </div>

              {/* Floor mini summary */}
              <div className="flex items-center gap-2 text-xs">
                {availableCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60 text-[11px]">
                    {availableCount} Trống
                  </span>
                )}
                {occupiedCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium border border-rose-200/60 text-[11px]">
                    {occupiedCount} Đang ở
                  </span>
                )}
                {cleaningCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200/60 text-[11px]">
                    {cleaningCount} Đang dọn
                  </span>
                )}
              </div>
            </div>

            {/* Rooms Grid for this floor */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {floorRooms.map((room) => {
                const statusMeta = ROOM_STATUS[room.status] || ROOM_STATUS.AVAILABLE;
                return (
                  <div
                    key={room.id}
                    className={`rounded-xl border p-3 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${statusMeta.color}`}
                    onClick={() => {
                      if (onSelectRoom) onSelectRoom(room);
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-lg text-slate-900">
                          P.{room.roomNumber}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${statusMeta.dot}`} />
                      </div>

                      <span className="text-[11px] font-semibold block truncate text-slate-600">
                        {room.type}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between text-[10px] font-medium">
                        <span>{statusMeta.label}</span>
                        {room.guestName && (
                          <span className="truncate max-w-[70px] text-slate-700 flex items-center gap-0.5 font-medium">
                            <User size={10} /> {room.guestName}
                          </span>
                        )}
                      </div>

                      {room.status === 'CLEANING' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onUpdateCleaning) onUpdateCleaning(room);
                          }}
                          className="w-full mt-2 py-1 px-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Sparkles size={11} />
                          <span>Xong dọn dẹp</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoomMatrixGrid;
