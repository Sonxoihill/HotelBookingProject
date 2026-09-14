import React, { useState } from 'react';
import { formatVND } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { Plus, Edit2, Trash2, DoorOpen } from 'lucide-react';

export const RoomManagementPage = () => {
  const [rooms, setRooms] = useState([
    { id: 1, roomNumber: '101', type: 'Standard Twin', price: 850000, maxGuests: 2, floor: 1 },
    { id: 2, roomNumber: '102', type: 'Standard Double', price: 890000, maxGuests: 2, floor: 1 },
    { id: 3, roomNumber: '201', type: 'Deluxe Ocean View', price: 1450000, maxGuests: 2, floor: 2 },
    { id: 4, roomNumber: '202', type: 'Premier Suite', price: 2850000, maxGuests: 4, floor: 2 },
    { id: 5, roomNumber: '301', type: 'Presidential Royal Suite', price: 4500000, maxGuests: 6, floor: 3 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'Deluxe Ocean View',
    price: '',
    maxGuests: '2',
    floor: '1',
  });

  const handleAddRoom = (e) => {
    e.preventDefault();
    setRooms([
      ...rooms,
      {
        id: Date.now(),
        roomNumber: newRoom.roomNumber,
        type: newRoom.type,
        price: Number(newRoom.price) || 1000000,
        maxGuests: Number(newRoom.maxGuests),
        floor: Number(newRoom.floor),
      },
    ]);
    setIsModalOpen(false);
    setNewRoom({ roomNumber: '', type: 'Deluxe Ocean View', price: '', maxGuests: '2', floor: '1' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
      setRooms(rooms.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản Lý Loại Phòng & Phòng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình danh mục phòng khách sạn, số phòng, sức chứa và giá niêm yết
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus size={16} />
          <span>Thêm Phòng Mới</span>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Số phòng</th>
              <th className="px-5 py-3.5">Loại phòng</th>
              <th className="px-5 py-3.5">Tầng</th>
              <th className="px-5 py-3.5">Sức chứa</th>
              <th className="px-5 py-3.5">Giá gốc niêm yết</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-900">P.{r.roomNumber}</td>
                <td className="px-5 py-3.5 font-medium text-slate-800">{r.type}</td>
                <td className="px-5 py-3.5">Tầng {r.floor}</td>
                <td className="px-5 py-3.5">{r.maxGuests} người lớn</td>
                <td className="px-5 py-3.5 font-bold text-amber-600">{formatVND(r.price)}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm phòng mới */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm phòng khách sạn mới"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddRoom}>
              Lưu phòng mới
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddRoom} className="space-y-4">
          <Input
            label="Số phòng *"
            placeholder="Ví dụ: 302"
            value={newRoom.roomNumber}
            onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Hạng / Loại phòng</label>
            <select
              value={newRoom.type}
              onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white"
            >
              <option value="Standard Twin">Standard Twin</option>
              <option value="Standard Double">Standard Double</option>
              <option value="Superior King">Superior King</option>
              <option value="Deluxe Ocean View">Deluxe Ocean View</option>
              <option value="Premier Suite">Premier Suite</option>
              <option value="Presidential Royal Suite">Presidential Royal Suite</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Giá niêm yết (VNĐ) *"
              type="number"
              placeholder="1200000"
              value={newRoom.price}
              onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
              required
            />
            <Input
              label="Tầng"
              type="number"
              value={newRoom.floor}
              onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomManagementPage;
