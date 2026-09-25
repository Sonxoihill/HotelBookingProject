import axiosInstance from './axiosInstance';

export const serviceService = {
  // Lấy danh sách dịch vụ trực tiếp từ Database qua API
  getServices: async () => {
    const response = await axiosInstance.get('/services');
    return response?.data || response;
  },
};

export default serviceService;
