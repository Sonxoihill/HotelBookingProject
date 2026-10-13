import axiosInstance from './axiosInstance';

/**
 * Service xử lý : Xem Báo cáo & Thống kê (Admin)
 * (Doanh thu theo ngày/tháng, tỷ lệ lấp đầy phòng, thống kê nguồn đặt phòng)
 */
export const reportService = {
  // Lấy các chỉ số KPI tổng quan (Dashboard Admin)
  getDashboardOverview: async () => {
    return await axiosInstance.get('/admin/reports/overview');
  },

  // Báo cáo doanh thu theo khoảng thời gian
  getRevenueReport: async (params) => {
    return await axiosInstance.get('/admin/reports/revenue', { params });
  },

  // Thống kê tỷ lệ lấp đầy phòng (Occupancy rate)
  getOccupancyReport: async (params) => {
    return await axiosInstance.get('/admin/reports/occupancy', { params });
  },

  // Xuất file báo cáo Excel / PDF
  exportReport: async (type, params) => {
    return await axiosInstance.get(`/admin/reports/export/${type}`, {
      params,
      responseType: 'blob',
    });
  },
};

export default reportService;
