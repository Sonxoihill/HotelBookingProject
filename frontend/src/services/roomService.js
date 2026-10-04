import axiosInstance from './axiosInstance';
import { getMockRooms, getMockRoomById } from '../mock/mockRoomsData';

/**
 * BIẾN CỜ KIỂM SOÁT MOCK DATA (Theo Plan 1 & Plan 2)
 * - Khi USE_MOCK = true: Chỉ đọc mock data, không gọi API backend (phục vụ test UI 100% frontend).
 * - Khi USE_MOCK = false: Bắn thẳng request vào API thật. Nếu API chết, UI sẽ văng lỗi đỏ để dev bắt backend sửa.
 * - Sau này khi Backend đã có API đầy đủ, xóa cờ này và thư mục mock theo Plan 2.
 */
const USE_MOCK = true;

/**
 * Service xử lý:
 * - Tìm kiếm & Lọc phòng (Khách hàng)
 * - Xem chi tiết phòng (Khách hàng)
 * - Xem Sơ đồ phòng (Lễ tân)
 * - Cập nhật Trạng thái dọn phòng (Lễ tân)
 * - Quản lý Loại phòng & Phòng (Admin)
 */
export const roomService = {
  // Lấy danh sách phòng công khai có phân trang (Trang chủ / Danh sách phòng)
  getPublicRooms: async (params) => {
    if (USE_MOCK) {
      const mockRooms = getMockRooms();
      return Promise.resolve({
        data: {
          content: mockRooms,
          totalPages: 1,
          totalElements: mockRooms.length,
        },
      });
    }

    return await axiosInstance.get('/rooms/public', { params });
  },

  // Lấy danh sách phòng có bộ lọc (ngày check-in, check-out, số người, hạng phòng, khoảng giá)
  getRooms: async (params) => {
    if (USE_MOCK) {
      const mockRooms = getMockRooms();
      return Promise.resolve({
        data: {
          content: mockRooms,
          totalPages: 1,
          totalElements: mockRooms.length,
        },
      });
    }

    return await axiosInstance.get('/rooms', { params });
  },

  // Tìm kiếm và lọc phòng trống theo tiêu chí và kiểm tra trùng lịch (UC04)
  searchRooms: async (params) => {
    return await axiosInstance.get('/rooms/search', { params });
  },


  // Lấy thông tin chi tiết một phòng
  getRoomById: async (roomId) => {
    if (USE_MOCK) {
      const room = getMockRoomById(roomId) || getMockRooms()[0];
      return Promise.resolve({
        data: room,
      });
    }

    return await axiosInstance.get(`/rooms/${roomId}`);
  },

  // Lấy ma trận sơ đồ phòng thời gian thực cho Lễ tân
  getRoomMatrix: async (params) => {
    if (USE_MOCK) {
      return Promise.resolve({ data: [] });
    }
    return await axiosInstance.get('/receptionist/room-matrix', { params });
  },

  // Lễ tân cập nhật trạng thái dọn dẹp phòng (CLEANING, AVAILABLE, DIRTY,...)
  updateCleaningStatus: async (roomId, status) => {
    if (USE_MOCK) {
      return Promise.resolve({ success: true });
    }
    return await axiosInstance.patch(`/rooms/${roomId}/cleaning-status`, { status });
  },

  // Admin - Lấy danh sách loại phòng & phòng
  getRoomTypes: async () => {
    if (USE_MOCK) {
      return Promise.resolve({ data: [] });
    }
    return await axiosInstance.get('/admin/room-types');
  },

  // Admin - Thêm loại phòng mới
  createRoomType: async (data) => {
    if (USE_MOCK) {
      return Promise.resolve({ success: true });
    }
    return await axiosInstance.post('/admin/room-types', data);
  },

  // Admin - Thêm phòng mới
  createRoom: async (roomData) => {
    if (USE_MOCK) {
      return Promise.resolve({ success: true });
    }
    return await axiosInstance.post('/admin/rooms', roomData);
  },

  // Admin - Cập nhật thông tin phòng
  updateRoom: async (roomId, roomData) => {
    if (USE_MOCK) {
      return Promise.resolve({ success: true });
    }
    return await axiosInstance.put(`/admin/rooms/${roomId}`, roomData);
  },

  // Admin - Xóa phòng
  deleteRoom: async (roomId) => {
    if (USE_MOCK) {
      return Promise.resolve({ success: true });
    }
    return await axiosInstance.delete(`/admin/rooms/${roomId}`);
  },
};

export default roomService;
