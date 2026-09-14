import React, { useState } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { Plus, Users, UserCheck, ShieldAlert, Trash2 } from 'lucide-react';

export const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([
    { id: 1, fullName: 'Lê Thu Hà', email: 'ha.le@luxestay.com', role: 'RECEPTIONIST', shift: 'Ca sáng', status: 'ACTIVE' },
    { id: 2, fullName: 'Trần Văn Mạnh', email: 'manh.tran@luxestay.com', role: 'RECEPTIONIST', shift: 'Ca chiều', status: 'ACTIVE' },
    { id: 3, fullName: 'Ngô Hải Yến', email: 'yen.ngo@luxestay.com', role: 'RECEPTIONIST', shift: 'Ca đêm', status: 'ACTIVE' },
    { id: 4, fullName: 'Vũ Đình Trọng', email: 'trong.vu@luxestay.com', role: 'ADMIN', shift: 'Hành chính', status: 'ACTIVE' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ fullName: '', email: '', role: 'RECEPTIONIST', shift: 'Ca sáng' });

  const handleAddStaff = (e) => {
    e.preventDefault();
    setStaffList([
      ...staffList,
      {
        id: Date.now(),
        fullName: newStaff.fullName,
        email: newStaff.email,
        role: newStaff.role,
        shift: newStaff.shift,
        status: 'ACTIVE',
      },
    ]);
    setIsModalOpen(false);
    setNewStaff({ fullName: '', email: '', role: 'RECEPTIONIST', shift: 'Ca sáng' });
  };

  const toggleStatus = (id) => {
    setStaffList(
      staffList.map((s) =>
        s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản Lý Nhân Sự Khách Sạn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấp quyền tài khoản cho Lễ tân, Quản lý ca trực và phân nhiệm vụ vận hành
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus size={16} />
          <span>Tạo Tài Khoản Nhân Sự</span>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Họ và tên</th>
              <th className="px-5 py-3.5">Email nội bộ</th>
              <th className="px-5 py-3.5">Vai trò hệ thống</th>
              <th className="px-5 py-3.5">Ca phân công</th>
              <th className="px-5 py-3.5">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-900">{s.fullName}</td>
                <td className="px-5 py-3.5 font-mono text-slate-600">{s.email}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      s.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {s.role === 'ADMIN' ? 'Quản trị viên' : 'Lễ tân quầy'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{s.shift}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => toggleStatus(s.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 mr-3 cursor-pointer"
                  >
                    {s.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}
                  </button>
                  <button
                    onClick={() => setStaffList(staffList.filter((item) => item.id !== s.id))}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Nhân Sự */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo tài khoản nhân viên mới"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddStaff}>
              Tạo tài khoản
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddStaff} className="space-y-4">
          <Input
            label="Họ và tên nhân viên *"
            placeholder="Ví dụ: Hoàng Mai Linh"
            value={newStaff.fullName}
            onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
            required
          />

          <Input
            label="Email đăng nhập *"
            type="email"
            placeholder="linh.hoang@luxestay.com"
            value={newStaff.email}
            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Vai trò</label>
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white"
              >
                <option value="RECEPTIONIST">Lễ tân quầy</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Ca phân công</label>
              <select
                value={newStaff.shift}
                onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white"
              >
                <option value="Ca sáng">Ca sáng (06:00 - 14:00)</option>
                <option value="Ca chiều">Ca chiều (14:00 - 22:00)</option>
                <option value="Ca đêm">Ca đêm (22:00 - 06:00)</option>
                <option value="Hành chính">Hành chính (08:00 - 17:00)</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagementPage;
