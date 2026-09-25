import axiosInstance from './axiosInstance';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Service xử lý  (Đăng ký) và  (Đăng nhập / Đăng xuất)
 */
export const authService = {
  // Đăng ký tài khoản khách hàng mới
  register: async (userData) => {
    return await axiosInstance.post('/auth/register', userData);
  },

  // Đăng nhập
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    const loginData = response?.data || response;
    if (loginData?.token) {
      tokenStorage.setToken(loginData.token);
    }
    if (loginData?.user) {
      tokenStorage.setUser(loginData.user);
    }
    return loginData;
  },

  // Đăng xuất
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi logout phía server nếu có
    } finally {
      tokenStorage.clearAuth();
    }
  },

  // Lấy thông tin user hiện tại qua token
  getCurrentUser: async () => {
    return await axiosInstance.get('/auth/me');
  },
};

export default authService;
