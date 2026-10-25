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

  // Lấy bảng báo giá chi tiết từng đêm kèm các quy tắc giá linh hoạt (GET /rooms/{id}/price-quote)
  getPriceQuote: async (roomId, params) => {
    return await axiosInstance.get(`/rooms/${roomId}/price-quote`, { params });
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

  // =========================================================================
  // ADMIN API - QUẢN LÝ LOẠI PHÒNG (ROOM CATEGORIES) - /admin/room-categories
  // =========================================================================
  // Lấy danh sách toàn bộ loại phòng
  getRoomCategories: async (params) => {
    return await axiosInstance.get('/admin/room-categories', { params });
  },

  // Lấy chi tiết một loại phòng theo ID
  getRoomCategoryById: async (id) => {
    return await axiosInstance.get(`/admin/room-categories/${id}`);
  },

  // Thêm mới loại phòng
  createRoomCategory: async (data) => {
    return await axiosInstance.post('/admin/room-categories', data);
  },

  // Cập nhật thông tin loại phòng
  updateRoomCategory: async (id, data) => {
    return await axiosInstance.put(`/admin/room-categories/${id}`, data);
  },

  // Xóa loại phòng
  deleteRoomCategory: async (id) => {
    return await axiosInstance.delete(`/admin/room-categories/${id}`);
  },

  // Alias tương thích ngược cho room-types -> room-categories
  getRoomTypes: async (params) => {
    return await axiosInstance.get('/admin/room-categories', { params });
  },
  createRoomType: async (data) => {
    return await axiosInstance.post('/admin/room-categories', data);
  },
  updateRoomType: async (id, data) => {
    return await axiosInstance.put(`/admin/room-categories/${id}`, data);
  },
  deleteRoomType: async (id) => {
    return await axiosInstance.delete(`/admin/room-categories/${id}`);
  },

  // =========================================================================
  // ADMIN API - QUẢN LÝ BUỒNG PHÒNG VẬT LÝ (ROOMS) - /admin/rooms
  // =========================================================================
  // Lấy danh sách toàn bộ buồng phòng vật lý (kèm lọc tầng, trạng thái, loại phòng)
  getAdminRooms: async (params) => {
    return await axiosInstance.get('/admin/rooms', { params });
  },

  // Lấy chi tiết buồng phòng theo ID
  getAdminRoomById: async (roomId) => {
    return await axiosInstance.get(`/admin/rooms/${roomId}`);
  },

  // Thêm mới phòng vật lý
  createRoom: async (roomData) => {
    return await axiosInstance.post('/admin/rooms', roomData);
  },

  // Cập nhật thông tin phòng vật lý
  updateRoom: async (roomId, roomData) => {
    return await axiosInstance.put(`/admin/rooms/${roomId}`, roomData);
  },

  // Xóa phòng vật lý
  deleteRoom: async (roomId) => {
    return await axiosInstance.delete(`/admin/rooms/${roomId}`);
  },
};

export default roomService;
