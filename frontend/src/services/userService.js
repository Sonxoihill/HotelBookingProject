import axiosInstance from './axiosInstance';

/**
 * Service xử lý: Quản lý hồ sơ cá nhân & Tải lên ảnh đại diện an toàn
 */
export const userService = {
  // Lấy thông tin hồ sơ người dùng
  getProfile: async () => {
    return await axiosInstance.get('/users/profile');
  },

  // Cập nhật thông tin hồ sơ
  updateProfile: async (profileData) => {
    return await axiosInstance.put('/users/profile', profileData);
  },

  // Tải lên ảnh đại diện với các chốt chặn bảo mật
  uploadAvatar: async (formData) => {
    return await axiosInstance.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Xóa ảnh đại diện (trở về chữ cái đầu)
  deleteAvatar: async () => {
    return await axiosInstance.delete('/users/avatar');
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    return await axiosInstance.put('/users/change-password', passwordData);
  },
};

export default userService;
