import axiosInstance from './axiosInstance';

/**
 * Service xử lý : Quản lý hồ sơ cá nhân
 * Kết nối 100% API Backend thật qua /users/profile
 */
export const userService = {
  // Lấy thông tin hồ sơ người dùng từ Database
  getProfile: async () => {
    return await axiosInstance.get('/users/profile');
  },

  // Cập nhật thông tin hồ sơ
  updateProfile: async (profileData) => {
    return await axiosInstance.put('/users/profile', profileData);
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    return await axiosInstance.put('/users/change-password', passwordData);
  },
};

export default userService;
