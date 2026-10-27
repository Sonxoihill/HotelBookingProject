import axiosInstance from './axiosInstance';

/**
 * Service xử lý: Báo cáo & Thống kê (Admin) - Scrum 53
 * Kết nối API Backend:
 * - GET /admin/reports/revenue (báo cáo doanh thu, KPIs, biểu đồ thời gian & tỷ trọng phòng)
 * - GET /admin/reports/export/{format} (xuất file EXCEL hoặc PDF dạng blob)
 */
export const reportService = {
  // Lấy báo cáo doanh thu và công suất phòng (startDate, endDate, reportType)
  getRevenueReport: async (params) => {
    return await axiosInstance.get('/admin/reports/revenue', { params });
  },

  // Alias getStatistics đồng bộ với getRevenueReport
  getStatistics: async (params) => {
    return await axiosInstance.get('/admin/reports/revenue', { params });
  },

  // Xuất file báo cáo (format: 'EXCEL' hoặc 'PDF') với responseType: 'blob'
  exportReport: async (format, params) => {
    const fileFormat = (format || 'EXCEL').toUpperCase();
    return await axiosInstance.get(`/admin/reports/export/${fileFormat}`, {
      params,
      responseType: 'blob',
    });
  },

  // Xuất file báo cáo dạng query param
  exportReportWithQuery: async (format, params) => {
    const fileFormat = (format || 'EXCEL').toUpperCase();
    return await axiosInstance.get('/admin/reports/export', {
      params: { ...params, format: fileFormat },
      responseType: 'blob',
    });
  },

  // Lấy các chỉ số KPI tổng quan (nếu cần)
  getDashboardOverview: async (params) => {
    return await axiosInstance.get('/admin/reports/revenue', { params });
  },
};

export default reportService;
