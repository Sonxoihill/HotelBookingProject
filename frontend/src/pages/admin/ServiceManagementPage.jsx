import React, { useState } from 'react';
import { formatVND } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { Plus, Edit2, Trash2, ConciergeBell } from 'lucide-react';

export const ServiceManagementPage = () => {
  const [services, setServices] = useState([
    { id: 1, name: 'Bữa sáng Buffet Quốc tế', category: 'Ẩm thực', price: 150000, unit: 'Người' },
    { id: 2, name: 'Nước suối đóng chai Lavie', category: 'Minibar', price: 20000, unit: 'Chai' },
    { id: 3, name: 'Bia Heineken lon', category: 'Minibar', price: 45000, unit: 'Lon' },
    { id: 4, name: 'Giặt sấy quần áo lấy nhanh', category: 'Giặt ủi', price: 60000, unit: 'Kg' },
    { id: 5, name: 'Đưa đón sân bay Đà Nẵng', category: 'Vận chuyển', price: 250000, unit: 'Chuyến' },
    { id: 6, name: 'Thuê xe máy tay ga', category: 'Phương tiện', price: 180000, unit: 'Ngày' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', category: 'Ẩm thực', price: '', unit: '' });

  const handleAddService = (e) => {
    e.preventDefault();
    setServices([
      ...services,
      {
        id: Date.now(),
        name: newService.name,
        category: newService.category,
        price: Number(newService.price) || 50000,
        unit: newService.unit || 'Lần',
      },
    ]);
    setIsModalOpen(false);
    setNewService({ name: '', category: 'Ẩm thực', price: '', unit: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Xóa dịch vụ này khỏi danh mục?')) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản Lý Danh Mục Dịch Vụ Khách Sạn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý bảng giá các dịch vụ ẩm thực, minibar, giặt ủi, phương tiện di chuyển
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus size={16} />
          <span>Thêm Dịch Vụ Mới</span>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Tên dịch vụ</th>
              <th className="px-5 py-3.5">Nhóm dịch vụ</th>
              <th className="px-5 py-3.5">Đơn vị tính</th>
              <th className="px-5 py-3.5">Đơn giá niêm yết</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-900">{s.name}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    {s.category}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{s.unit}</td>
                <td className="px-5 py-3.5 font-bold text-amber-600">{formatVND(s.price)}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
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

      {/* Modal Thêm Dịch Vụ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm dịch vụ mới vào danh mục"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddService}>
              Lưu dịch vụ
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddService} className="space-y-4">
          <Input
            label="Tên dịch vụ *"
            placeholder="Ví dụ: Nước cam ép nguyên chất"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Nhóm phân loại</label>
            <select
              value={newService.category}
              onChange={(e) => setNewService({ ...newService, category: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white"
            >
              <option value="Minibar">Minibar trong phòng</option>
              <option value="Ẩm thực">Ẩm thực & Nhà hàng</option>
              <option value="Giặt ủi">Giặt ủi & Buồng phòng</option>
              <option value="Vận chuyển">Vận chuyển & Đưa đón</option>
              <option value="Phương tiện">Thuê phương tiện</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Đơn giá (VNĐ) *"
              type="number"
              placeholder="50000"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              required
            />
            <Input
              label="Đơn vị tính *"
              placeholder="Ly, Lon, Chai, Lượt..."
              value={newService.unit}
              onChange={(e) => setNewService({ ...newService, unit: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceManagementPage;
