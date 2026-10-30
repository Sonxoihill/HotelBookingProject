import axiosInstance from './axiosInstance';

/**
 * Service xử lý: Cài đặt Giá linh hoạt (Quản trị viên)
 * Kết nối API Backend qua /admin/pricing-rules
 */
export const pricingService = {
  // Lấy danh sách quy tắc giá linh hoạt
  getPricingRules: async (params) => {
    return await axiosInstance.get('/admin/pricing-rules', { params });
  },

  // Lấy chi tiết một quy tắc giá theo ID
  getPricingRuleById: async (ruleId) => {
    return await axiosInstance.get(`/admin/pricing-rules/${ruleId}`);
  },

  // Tạo mới quy tắc giá
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
