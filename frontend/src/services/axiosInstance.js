import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Cấu hình Axios Instance kết nối Backend API
 * Đọc baseURL từ biến môi trường VITE_API_BASE_URL (mặc định: http://localhost:5000/api)
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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
        // Token hết hạn hoặc không hợp lệ -> xóa token
        console.warn('Phiên đăng nhập đã hết hạn hoặc không hợp lệ (401).');
        tokenStorage.clearAuth();
      }

      if (status === 403) {
        console.warn('Truy cập bị từ chối: Tài khoản không có quyền hạn cần thiết (403 Forbidden).');
      }

      const errorMessage = data?.message || error.message || 'Có lỗi xảy ra khi kết nối máy chủ.';
      const customError = new Error(errorMessage);
      customError.status = status;
      customError.errors = data?.errors;
      customError.data = data;
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
