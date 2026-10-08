import axiosInstance from './axiosInstance';
import { USE_MOCK } from './config';
import { mockUserService } from '../mocks/mockServices';

/**
 * Service xử lý : Quản lý hồ sơ cá nhân
 */
export const userService = {
  // Lấy thông tin hồ sơ người dùng
  getProfile: async () => {
    if (USE_MOCK) {
      return await mockUserService.getProfile();
    }
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
