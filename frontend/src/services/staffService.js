import axiosInstance from './axiosInstance';

/**
 * Service xử lý: Quản lý Nhân sự & Phân quyền (Admin)
 * Toàn bộ kết nối sử dụng endpoint /admin/users theo chuẩn Scrum 52
 * (Xóa bỏ hoàn toàn các endpoint /admin/staff cũ)
 */
export const staffService = {
  // Lấy danh sách tài khoản (truyền params: search, role, page, size)
  getAllStaff: async (params) => {
    return await axiosInstance.get('/admin/users', { params });
  },

  getUsers: async (params) => {
    return await axiosInstance.get('/admin/users', { params });
  },

  // Lấy chi tiết tài khoản theo ID
  getUserById: async (userId) => {
    return await axiosInstance.get(`/admin/users/${userId}`);
  },

  // Tạo tài khoản mới (POST /admin/users)
  createStaff: async (userData) => {
    return await axiosInstance.post('/admin/users', userData);
  },

  createUser: async (userData) => {
    return await axiosInstance.post('/admin/users', userData);
  },

  // Cập nhật phân quyền / vai trò (PATCH /admin/users/{id}/role)
  updateStaffRole: async (userId, role) => {
    return await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
  },

  updateUserRole: async (userId, role) => {
    return await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
  },

  // Khóa / Mở khóa tài khoản (PATCH /admin/users/{id}/status)
  toggleStaffStatus: async (userId, statusData) => {
    const payload = typeof statusData === 'boolean' ? { isActive: statusData } : statusData;
    return await axiosInstance.patch(`/admin/users/${userId}/status`, payload);
  },

  toggleUserStatus: async (userId, statusData) => {
    const payload = typeof statusData === 'boolean' ? { isActive: statusData } : statusData;
    return await axiosInstance.patch(`/admin/users/${userId}/status`, payload);
  },

  // Xóa tài khoản
  deleteStaff: async (userId) => {
    return await axiosInstance.delete(`/admin/users/${userId}`);
  },

  deleteUser: async (userId) => {
    return await axiosInstance.delete(`/admin/users/${userId}`);
  },
};

export default staffService;
