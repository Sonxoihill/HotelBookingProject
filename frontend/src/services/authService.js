import axiosInstance from './axiosInstance';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Service xử lý Xác thực (Đăng ký, Đăng nhập, Đăng xuất)
 */

// Hàm API đăng nhập (SCRUM-36)
export const loginApi = async (data) => {
  return await axiosInstance.post('/auth/login', data);
};

// Hàm API đăng ký (SCRUM-36)
export const registerApi = async (data) => {
  return await axiosInstance.post('/auth/register', data);
};

export const authService = {
  loginApi,
  registerApi,

  // Đăng ký tài khoản khách hàng mới
  register: async (userData) => {
    return await registerApi(userData);
  },

  // Đăng nhập và tự động lưu session vào tokenStorage
  login: async (credentials) => {
    const response = await loginApi(credentials);
    const authData = response?.data || response;
    if (authData?.token) {
      tokenStorage.setToken(authData.token);
    }
    if (authData?.email) {
      tokenStorage.setUser({
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      });
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
