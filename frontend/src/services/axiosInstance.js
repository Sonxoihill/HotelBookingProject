import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Cấu hình Axios Instance kết nối Backend API
 * Đọc baseURL từ biến môi trường VITE_API_BASE_URL (mặc định: http://localhost:5000/api)
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Tự động lấy JWT Token từ LocalStorage và gắn vào tiêu đề Authorization: Bearer <token>
 * của mọi Yêu cầu gửi đi.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Tự động xử lý lỗi tập trung, phát hiện token hết hạn (401)
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token hết hạn hoặc không hợp lệ -> tự động xóa token và chuyển về trang login
        console.warn('Phiên đăng nhập đã hết hạn hoặc không hợp lệ (401). Tự động xóa token và chuyển về đăng nhập.');
        tokenStorage.clearAuth();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }

      const errorMessage = data?.message || error.message || 'Có lỗi xảy ra khi kết nối máy chủ.';
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
