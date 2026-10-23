import axiosInstance from './axiosInstance';

/**
 * Service xử lý:
 * - Tìm kiếm & Lọc phòng (Khách hàng)
 * - Xem chi tiết phòng (Khách hàng)
 * - Xem Sơ đồ phòng (Lễ tân)
 * - Cập nhật Trạng thái dọn phòng (Lễ tân)
 * - Quản lý Loại phòng & Phòng (Admin)
 * Kết nối 100% API Backend thật qua /rooms
 */
export const roomService = {
  // Lấy danh sách phòng công khai có phân trang (Trang chủ / Danh sách phòng)
  getPublicRooms: async (params) => {
    return await axiosInstance.get('/rooms/public', { params });
  },

  // Lấy danh sách phòng có bộ lọc (ngày check-in, check-out, số người, hạng phòng, khoảng giá)
  getRooms: async (params) => {
    return await axiosInstance.get('/rooms', { params });
  },

  // Tìm kiếm & Lọc phòng trống (UC04)
  searchRooms: async (params) => {
    return await axiosInstance.get('/rooms/search', { params });
  },

  // Lấy thông tin chi tiết một phòng từ Database (UC05)
  getRoomById: async (roomId) => {
    return await axiosInstance.get(`/rooms/${roomId}`);
  },

  // Lấy ma trận sơ đồ phòng thời gian thực cho Lễ tân
  getRoomMatrix: async (params) => {
    return await axiosInstance.get('/receptionist/room-matrix', { params });
  },

  // Phase 1: Lấy danh sách ma trận phòng kèm bộ lọc tầng & trạng thái (GET /api/v1/receptionist/rooms/grid)
  getRoomGrid: async (params = {}) => {
    return await axiosInstance.get('/receptionist/rooms/grid', { params });
  },

  // Phase 1: Xác nhận dọn xong phòng (PATCH /api/v1/receptionist/rooms/{roomId}/clean)
  cleanRoom: async (roomId) => {
    return await axiosInstance.patch(`/receptionist/rooms/${roomId}/clean`);
  },

  // Lễ tân cập nhật trạng thái dọn dẹp phòng (CLEANING, AVAILABLE, DIRTY,...)
  updateCleaningStatus: async (roomId, status) => {
    return await axiosInstance.patch(`/rooms/${roomId}/cleaning-status`, { status });
  },

  // Admin - Lấy danh sách loại phòng & phòng
  getRoomTypes: async () => {
    return await axiosInstance.get('/admin/room-types');
  },

  // Admin - Thêm loại phòng mới
  createRoomType: async (data) => {
    return await axiosInstance.post('/admin/room-types', data);
  },

  // Admin - Thêm phòng mới
  createRoom: async (roomData) => {
    return await axiosInstance.post('/admin/rooms', roomData);
  },

  // Admin - Cập nhật thông tin phòng
  updateRoom: async (roomId, roomData) => {
    return await axiosInstance.put(`/admin/rooms/${roomId}`, roomData);
  },
};

export default roomService;
