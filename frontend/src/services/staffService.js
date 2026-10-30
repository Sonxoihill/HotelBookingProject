import axiosInstance from './axiosInstance';

/**
 * Service xử lý: Quản lý Nhân sự & Phân quyền (Admin) - Scrum 52
 * Toàn bộ kết nối sử dụng endpoint /admin/users chuẩn REST theo Backend
 */
export const staffService = {
  // Lấy danh sách người dùng và nhân sự (GET /admin/users?keyword=...&role=...&page=...&size=...)
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

  // Cấp tài khoản nhân sự mới (POST /admin/users/staff)
  createStaff: async (userData) => {
    return await axiosInstance.post('/admin/users/staff', userData);
  },

  createUser: async (userData) => {
    return await axiosInstance.post('/admin/users/staff', userData);
  },

  // Phân quyền / Đổi vai trò người dùng (PATCH /admin/users/{id}/role với body { role })
  updateStaffRole: async (userId, role) => {
    return await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
  },

  updateUserRole: async (userId, role) => {
    return await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
  },

  // Khóa / Mở khóa tài khoản người dùng (PATCH /admin/users/{id}/lock - đảo trạng thái ACTIVE <-> LOCKED)
  toggleStaffStatus: async (userId) => {
    return await axiosInstance.patch(`/admin/users/${userId}/lock`);
  },

  toggleUserLock: async (userId) => {
    return await axiosInstance.patch(`/admin/users/${userId}/lock`);
  },

  toggleUserStatus: async (userId) => {
    return await axiosInstance.patch(`/admin/users/${userId}/lock`);
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
