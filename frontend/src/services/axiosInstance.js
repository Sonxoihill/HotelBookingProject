import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * Cấu hình Axios Instance kết nối Backend API
 * Đọc baseURL trực tiếp từ biến môi trường Vite qua cú pháp import.meta.env.VITE_API_BASE_URL
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 60000,
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
 * Tự động xử lý lỗi tập trung, phát hiện token hết hạn (401),
 * truyền trực tiếp thông báo lỗi và danh sách lỗi validation Tiếng Việt từ Backend.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Đối với response dạng blob (xuất file Excel/PDF), giữ nguyên response để đọc Content-Disposition header
    if (response.config?.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token hết hạn hoặc tài khoản bị khóa (401) -> xóa token và chuyển hướng về /login
        console.warn('Phiên đăng nhập đã hết hạn hoặc tài khoản bị khóa (401).');
        tokenStorage.clearAuth();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      if (status === 403) {
        // Không có quyền truy cập (403 Forbidden) -> chuyển hướng về /403
        console.warn('Truy cập bị từ chối: Tài khoản không có quyền hạn cần thiết (403 Forbidden).');
        if (typeof window !== 'undefined' && window.location.pathname !== '/403') {
          window.location.href = '/403';
        }
      }

      let errorMessage = data?.message || error.message || 'Có lỗi xảy ra khi kết nối máy chủ.';
      if (data?.errors && typeof data.errors === 'object') {
        const fieldErrorValues = Object.values(data.errors).filter(Boolean);
        if (fieldErrorValues.length > 0 && (errorMessage === 'Dữ liệu đầu vào không hợp lệ' || !errorMessage)) {
          errorMessage = fieldErrorValues.join('; ');
        }
      }

      const customError = new Error(errorMessage);
      customError.status = status;
      customError.errors = data?.errors;
      customError.data = data;
      customError.response = error.response;
      return Promise.reject(customError);
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = new Error(
        'Máy chủ phản hồi quá lâu hoặc đang khởi động (Render Cold Start). Vui lòng thử lại sau vài giây.'
      );
      timeoutError.code = 'ECONNABORTED';
      return Promise.reject(timeoutError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
