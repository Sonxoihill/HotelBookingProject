import React, { useState } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { Plus, Edit2, Trash2, Lock, Unlock, CheckCircle2 } from 'lucide-react';

export const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([
    { id: 1, fullName: 'Lê Thu Hà', email: 'ha.le@luxestay.com', role: 'RECEPTIONIST', shift: 'Ca sáng', status: 'ACTIVE' },
    { id: 2, fullName: 'Trần Văn Mạnh', email: 'manh.tran@luxestay.com', role: 'RECEPTIONIST', shift: 'Ca chiều', status: 'ACTIVE' },
    { id: 3, fullName: 'Ngô Hải Yến', email: 'yen.ngo@luxestay.com', role: 'RECEPTIONIST', shift: 'Ca đêm', status: 'ACTIVE' },
    { id: 4, fullName: 'Vũ Đình Trọng', email: 'trong.vu@luxestay.com', role: 'ADMIN', shift: 'Hành chính', status: 'ACTIVE' },
  ]);

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    email: '',
    role: 'RECEPTIONIST',
    shift: 'Ca sáng',
  });

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [alertSuccess, setAlertSuccess] = useState('');

  // Handle Add Staff
  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.fullName.trim() || !newStaff.email.trim()) {
      alert('Vui lòng điền đầy đủ họ tên và email.');
      return;
    }

    const createdStaff = {
      id: Date.now(),
      fullName: newStaff.fullName.trim(),
      email: newStaff.email.trim(),
      role: newStaff.role,
      shift: newStaff.shift,
      status: 'ACTIVE',
    };

    setStaffList([...staffList, createdStaff]);
    setIsCreateModalOpen(false);
    setNewStaff({ fullName: '', email: '', role: 'RECEPTIONIST', shift: 'Ca sáng' });

    setAlertSuccess(`Tạo tài khoản cho "${createdStaff.fullName}" thành công!`);
    setTimeout(() => setAlertSuccess(''), 4000);
  };

  // Open Edit Modal
  const handleOpenEdit = (staff) => {
    setEditingStaff({ ...staff });
    setIsEditModalOpen(true);
  };

  // Handle Save Edit Staff
  const handleSaveEditStaff = (e) => {
    e.preventDefault();
    if (!editingStaff.fullName.trim() || !editingStaff.email.trim()) {
      alert('Vui lòng điền đầy đủ họ tên và email.');
      return;
    }

    setStaffList((prev) =>
      prev.map((s) => (s.id === editingStaff.id ? { ...editingStaff } : s))
    );
    setIsEditModalOpen(false);

    setAlertSuccess(`Cập nhật thông tin nhân viên "${editingStaff.fullName}" thành công!`);
    setTimeout(() => setAlertSuccess(''), 4000);
  };

  // Toggle Active / Inactive Status
  const toggleStatus = (id) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : s
      )
    );
  };

  // Delete Staff
  const handleDeleteStaff = (id, fullName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${fullName}" khỏi hệ thống?`)) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      setAlertSuccess(`Đã xóa nhân sự "${fullName}".`);
      setTimeout(() => setAlertSuccess(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản Lý Nhân Sự Khách Sạn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấp quyền tài khoản cho Lễ tân, Quản trị viên, phân ca trực và điều chỉnh hồ sơ nhân sự
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-1.5"
        >
          <Plus size={16} />
          <span>Tạo Tài Khoản Nhân Sự</span>
        </Button>
      </div>

      {/* Success Notification Alert */}
      {alertSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{alertSuccess}</span>
          </div>
          <button
            onClick={() => setAlertSuccess('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Staff Table */}
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
                <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                    {s.fullName.trim().split(' ').pop()?.[0] || 'NV'}
                  </div>
                  <span>{s.fullName}</span>
                </td>
                <td className="px-5 py-3.5 font-mono text-slate-600">{s.email}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      s.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200/60'
                        : 'bg-cyan-100 text-cyan-800 border border-cyan-200/60'
                    }`}
                  >
                    {s.role === 'ADMIN' ? 'Quản trị viên' : 'Lễ tân quầy'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-700 font-medium">{s.shift}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* NÚT THAO TÁC SỬA */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                      title="Chỉnh sửa thông tin nhân sự"
                    >
                      <Edit2 size={13} />
                      <span>Sửa</span>
                    </button>

                    {/* Nút Khóa / Mở Khóa */}
                    <button
                      type="button"
                      onClick={() => toggleStatus(s.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[11px] ${
                        s.status === 'ACTIVE'
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={s.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {s.status === 'ACTIVE' ? <Lock size={13} /> : <Unlock size={13} />}
                      <span>{s.status === 'ACTIVE' ? 'Khóa' : 'Mở'}</span>
                    </button>

                    {/* Nút Xóa */}
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(s.id, s.fullName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa nhân viên"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: TẠO TÀI KHOẢN NHÂN SỰ MỚI */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Tài Khoản Nhân Viên Mới"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleAddStaff}>
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
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 cursor-pointer"
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
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 cursor-pointer"
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

      {/* MODAL: CHỈNH SỬA THÔNG TIN NHÂN SỰ */}
      {editingStaff && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Chỉnh Sửa Nhân Sự: ${editingStaff.fullName}`}
          footer={
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveEditStaff}
              >
                Lưu thay đổi
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveEditStaff} className="space-y-4">
            <Input
              label="Họ và tên nhân viên *"
              value={editingStaff.fullName}
              onChange={(e) =>
                setEditingStaff({ ...editingStaff, fullName: e.target.value })
              }
              required
            />

            <Input
              label="Email nội bộ *"
              type="email"
              value={editingStaff.email}
              onChange={(e) =>
                setEditingStaff({ ...editingStaff, email: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Vai trò hệ thống</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, role: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 cursor-pointer"
                >
                  <option value="RECEPTIONIST">Lễ tân quầy</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Ca phân công</label>
                <select
                  value={editingStaff.shift}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, shift: e.target.value })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 cursor-pointer"
                >
                  <option value="Ca sáng">Ca sáng (06:00 - 14:00)</option>
                  <option value="Ca chiều">Ca chiều (14:00 - 22:00)</option>
                  <option value="Ca đêm">Ca đêm (22:00 - 06:00)</option>
                  <option value="Hành chính">Hành chính (08:00 - 17:00)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700">Trạng thái hoạt động</label>
              <select
                value={editingStaff.status}
                onChange={(e) =>
                  setEditingStaff({ ...editingStaff, status: e.target.value })
                }
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 cursor-pointer"
              >
                <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Tạm khóa tài khoản (INACTIVE)</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StaffManagementPage;
