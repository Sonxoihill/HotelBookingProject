import axiosInstance from './axiosInstance';

/**
 * Service xử lý:
 * - Quản lý Dịch vụ phát sinh (Lễ tân gán dịch vụ phát sinh: giặt ủi, minibar, ẩm thực vào booking)
 * - Quản lý Dịch vụ (Admin CRUD danh mục dịch vụ khách sạn)
 */
export const extraService = {
  // Lấy danh mục dịch vụ khả dụng trong khách sạn
  getServiceCatalog: async () => {
    return await axiosInstance.get('/services');
  },

  // Lễ tân thêm dịch vụ phát sinh vào một đơn đặt phòng cụ thể
  addExtraServiceToBooking: async (bookingId, serviceUsageData) => {
    return await axiosInstance.post(`/receptionist/bookings/${bookingId}/extra-services`, serviceUsageData);
  },

  // Lấy danh sách các dịch vụ phát sinh của một đơn phòng
  getBookingExtraServices: async (bookingId) => {
    return await axiosInstance.get(`/receptionist/bookings/${bookingId}/extra-services`);
  },

  // Admin thêm dịch vụ mới vào danh mục
  createService: async (serviceData) => {
    return await axiosInstance.post('/admin/services', serviceData);
  },

  // Admin cập nhật thông tin/giá dịch vụ
  updateService: async (serviceId, serviceData) => {
    return await axiosInstance.put(`/admin/services/${serviceId}`, serviceData);
  },

  // Admin xóa dịch vụ
  deleteService: async (serviceId) => {
    return await axiosInstance.delete(`/admin/services/${serviceId}`);
  },
};

export default extraService;
