import axiosInstance from './axiosInstance';

/**
 * Service xử lý: Báo cáo & Thống kê (Admin) - Scrum 53
 * Hỗ trợ lấy dữ liệu thống kê tổng hợp, doanh thu, công suất phòng và xuất file Excel/PDF
 */
export const reportService = {
  // Lấy báo cáo thống kê tổng hợp (Từ ngày, Đến ngày, Report Type)
  getStatistics: async (params) => {
    return await axiosInstance.get('/admin/reports/statistics', { params });
  },

  // Lấy báo cáo doanh thu theo mốc thời gian
  getRevenueReport: async (params) => {
    return await axiosInstance.get('/admin/reports/revenue', { params });
  },

  // Lấy báo cáo công suất phòng (Occupancy)
  getOccupancyReport: async (params) => {
    return await axiosInstance.get('/admin/reports/occupancy', { params });
  },

  // Lấy các chỉ số KPI tổng quan (Dashboard Admin)
  getDashboardOverview: async (params) => {
    return await axiosInstance.get('/admin/reports/overview', { params });
  },

  // Xuất file báo cáo (Excel / PDF) với cấu hình responseType: 'blob'
  exportReport: async (format, params) => {
    return await axiosInstance.get(`/admin/reports/export/${format}`, {
      params,
      responseType: 'blob',
    });
  },

  // Dự phòng xuất file qua endpoint query ?format=...
  exportReportWithFormat: async (params) => {
    return await axiosInstance.get('/admin/reports/export', {
      params,
      responseType: 'blob',
    });
  },
};

export default reportService;
