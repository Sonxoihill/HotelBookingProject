import React from 'react';
import { ROOM_STATUS } from '../../utils/constants';
import { formatVND } from '../../utils/formatters';
import { User, Sparkles, AlertCircle } from 'lucide-react';

export const RoomMatrixGrid = ({ rooms = [], onSelectRoom, onUpdateCleaning }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
      {rooms.map((room) => {
        const statusMeta = ROOM_STATUS[room.status] || ROOM_STATUS.AVAILABLE;
        return (
          <div
            key={room.id}
            className={`rounded-xl border p-3 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${statusMeta.color}`}
            onClick={() => onSelectRoom && onSelectRoom(room)}
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
                  <span className="truncate max-w-[70px] text-slate-700 flex items-center gap-0.5">
                    <User size={10} /> {room.guestName}
                  </span>
                )}
              </div>

              {room.status === 'CLEANING' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateCleaning && onUpdateCleaning(room);
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
  );
};

export default RoomMatrixGrid;
