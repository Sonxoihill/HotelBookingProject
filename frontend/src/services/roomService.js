import axiosInstance from './axiosInstance';

/**
 * Service xử lý:
 * - Tìm kiếm & Lọc phòng (Khách hàng)
 * - Xem chi tiết phòng (Khách hàng)
 * - Xem Sơ đồ phòng (Lễ tân)
 * - Cập nhật Trạng thái dọn phòng (Lễ tân)
 * - Quản lý Loại phòng & Phòng (Admin)
 */
export const roomService = {
  // Lấy danh sách phòng có bộ lọc (ngày check-in, check-out, số người, hạng phòng, khoảng giá)
  getRooms: async (params) => {
    return await axiosInstance.get('/rooms', { params });
  },

  // Lấy thông tin chi tiết một phòng
  getRoomById: async (roomId) => {
    return await axiosInstance.get(`/rooms/${roomId}`);
  },

  // Lấy ma trận sơ đồ phòng thời gian thực cho Lễ tân
  getRoomMatrix: async (params) => {
    return await axiosInstance.get('/receptionist/room-matrix', { params });
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

  // Admin - Xóa phòng
  deleteRoom: async (roomId) => {
    return await axiosInstance.delete(`/admin/rooms/${roomId}`);
  },
};

export default roomService;
