/**
 * Mock Data: Thông tin tài khoản người dùng
 * Mô phỏng dữ liệu phản hồi từ Backend API /users/profile
 */
export const MOCK_USER_PROFILE = {
  id: 101,
  fullName: 'Nguyễn Văn An',
  email: 'nguyenvanan@gmail.com',
  phone: '0912345678', // Chuẩn theo regex: /^(0|\+84)[35789]\d{8}$/
  role: 'CUSTOMER',
  status: 'ACTIVE',
  createdAt: '2026-01-15T08:30:00Z',
};

/**
 * Lấy hồ sơ tài khoản từ Mock Data
 */
export const getMockUserProfile = () => {
  return { ...MOCK_USER_PROFILE };
};
