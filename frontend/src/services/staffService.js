import axiosInstance from './axiosInstance';

/**
 * Service xử lý : Quản lý Nhân sự (Admin)
 * (Tạo tài khoản lễ tân, phân quyền ca trực, khóa/mở tài khoản)
 */
export const staffService = {
  // Lấy danh sách nhân sự
  getAllStaff: async (params) => {
    return await axiosInstance.get('/admin/staff', { params });
  },

  // Tạo tài khoản nhân sự mới (Lễ tân / Quản lý)
  createStaff: async (staffData) => {
    return await axiosInstance.post('/admin/staff', staffData);
  },

  // Cập nhật thông tin nhân sự
  updateStaff: async (staffId, staffData) => {
    return await axiosInstance.put(`/admin/staff/${staffId}`, staffData);
  },

  // Khóa / Kích hoạt tài khoản nhân viên
  toggleStaffStatus: async (staffId, isActive) => {
    return await axiosInstance.patch(`/admin/staff/${staffId}/status`, { isActive });
  },

  // Xóa tài khoản nhân sự
  deleteStaff: async (staffId) => {
    return await axiosInstance.delete(`/admin/staff/${staffId}`);
  },
};

export default staffService;
