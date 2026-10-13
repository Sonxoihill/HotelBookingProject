import axiosInstance from './axiosInstance';

/**
 * Service xử lý : Cài đặt Giá linh hoạt (Quản trị viên)
 * (Giá theo mùa cao điểm, ngày lễ tết, cuối tuần thứ 6 - CN)
 */
export const pricingService = {
  // Lấy danh sách quy tắc giá linh hoạt
  getPricingRules: async (params) => {
    return await axiosInstance.get('/admin/pricing-rules', { params });
  },

  // Tạo quy tắc giá mới (áp dụng cho ngày cụ thể hoặc khoảng thời gian)
  createPricingRule: async (ruleData) => {
    return await axiosInstance.post('/admin/pricing-rules', ruleData);
  },

  // Cập nhật quy tắc giá
  updatePricingRule: async (ruleId, ruleData) => {
    return await axiosInstance.put(`/admin/pricing-rules/${ruleId}`, ruleData);
  },

  // Xóa quy tắc giá
  deletePricingRule: async (ruleId) => {
    return await axiosInstance.delete(`/admin/pricing-rules/${ruleId}`);
  },
};

export default pricingService;
