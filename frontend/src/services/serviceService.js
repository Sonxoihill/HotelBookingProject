import axiosInstance from './axiosInstance';

export const serviceService = {
  // Lấy danh sách dịch vụ công khai / lễ tân
  getServices: async (params) => {
    const response = await axiosInstance.get('/services', { params });
    return response?.data || response;
  },

  // =========================================================================
  // ADMIN API - QUẢN LÝ DỊCH VỤ KHÁCH SẠN (SERVICES) - /admin/services
  // =========================================================================
  // Admin: Lấy danh sách toàn bộ dịch vụ (kèm bộ lọc danh mục, trạng thái)
  getAdminServices: async (params) => {
    return await axiosInstance.get('/admin/services', { params });
  },

  // Admin: Lấy chi tiết một dịch vụ theo ID
  getServiceById: async (id) => {
    return await axiosInstance.get(`/admin/services/${id}`);
  },

  // Admin: Thêm dịch vụ mới
  createService: async (serviceData) => {
    return await axiosInstance.post('/admin/services', serviceData);
  },

  // Admin: Cập nhật thông tin dịch vụ
  updateService: async (id, serviceData) => {
    return await axiosInstance.put(`/admin/services/${id}`, serviceData);
  },

  // Admin: Xóa hoặc chuyển trạng thái ngừng hoạt động dịch vụ
  deleteService: async (id) => {
    return await axiosInstance.delete(`/admin/services/${id}`);
  },
};

export default serviceService;
