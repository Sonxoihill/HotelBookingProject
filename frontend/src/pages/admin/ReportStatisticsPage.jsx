import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Download,
  ChevronDown,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  DollarSign,
  BedDouble,
  Layers,
  ArrowUpRight,
  Filter,
  X,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { reportService } from '../../services/reportService';
import roomService from '../../services/roomService';
import { formatVND } from '../../utils/formatters';

// Bảng màu sang trọng L'Étoile cho Biểu đồ tròn
const PIE_COLORS = [
  '#0E1524', // Đen than chì (Luxury Navy/Black)
  '#8E6941', // Đồng ấm (Warm Bronze)
  '#D97706', // Hổ phách (Amber Gold)
  '#57534E', // Đá Bazan (Stone 600)
  '#78716C', // Xám đá (Stone 500)
  '#A8A29E', // Bạc kim (Stone 400)
];

export const ReportStatisticsPage = () => {
  // =========================================================================
  // 1. STATE BỘ LỌC THỜI GIAN & LOẠI BÁO CÁO (Mặc định 6 tháng gần nhất)
  // =========================================================================
  const getDefaultDateRange = () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const formatToYMD = (date) => date.toISOString().split('T')[0];
    return {
      start: formatToYMD(sixMonthsAgo),
      end: formatToYMD(today),
    };
  };

  const defaultRange = useMemo(() => getDefaultDateRange(), []);

  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [reportType, setReportType] = useState('MONTHLY');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Tải danh mục loại phòng ban đầu để làm option trong bộ lọc
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await roomService.getRoomCategories();
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : (data?.content || data?.items || []);
        if (Array.isArray(list)) {
          const names = list.map((c) => c.name || c.categoryName).filter(Boolean);
          setCategoryOptions(names);
        }
      } catch (e) {
        console.warn('Không thể tải trước danh mục loại phòng:', e);
      }
    };
    loadCategories();
  }, []);

  // Ràng buộc kiểm tra ngày: Từ ngày không được đứng sau Đến ngày
  const dateError = useMemo(() => {
    if (startDate && endDate && startDate > endDate) {
      return 'Từ ngày không được đứng sau Đến ngày.';
    }
    return null;
  }, [startDate, endDate]); // 'DAILY', 'MONTHLY', 'BY_CATEGORY'

  // =========================================================================
  // 2. STATE DỮ LIỆU BÁO CÁO & LOADING
  // =========================================================================
  const [reportData, setReportData] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Toast thông báo
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // =========================================================================
  // 3. TẢI DỮ LIỆU BÁO CÁO THỐNG KÊ TỪ BACKEND (/admin/reports/revenue)
  // =========================================================================
  const fetchReportData = useCallback(async () => {
    if (startDate && endDate && startDate > endDate) {
      showToast('Khoảng thời gian không hợp lệ: Từ ngày không được đứng sau Đến ngày.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const params = {
        startDate,
        endDate,
        reportType,
      };

      const response = await reportService.getRevenueReport(params);
      const data = response?.data || response;

      // Kiểm tra trạng thái hasData từ RevenueReportResponse DTO
      if (!data || data.hasData === false) {
        setHasData(false);
        setReportData(null);
        return;
      }

      // Map đúng các trường từ SummaryMetrics DTO
      const summary = data.summaryMetrics || {};
      const metrics = {
        totalRevenue: summary.totalRevenue ?? 0,
        roomRevenue: summary.roomRevenue ?? 0,
        serviceRevenue: summary.serviceRevenue ?? 0,
        completedBookings: summary.completedBookings ?? 0,
        occupancyRate: summary.occupancyRate ?? 0,
        mostBookedRoomType: summary.topCategory || 'Chưa xác định',
      };

      // Map mốc thời gian từ RevenueByTime DTO: { label, roomRevenue, serviceRevenue, totalRevenue, occupancyRate }
      const timeline = (data.revenueByTime || []).map((t) => ({
        ...t,
        label: t.label || t.period || '',
        roomRevenue: Number(t.roomRevenue || 0),
        serviceRevenue: Number(t.serviceRevenue || 0),
        totalRevenue: Number(t.totalRevenue || 0),
        occupancyRate: Number(t.occupancyRate || 0),
      }));

      // Map tỷ trọng phòng từ RoomCategoryShare DTO: { categoryName, bookingCount, revenue, percentage }
      const roomTypes = (data.roomCategoryShare || []).map((c) => ({
        ...c,
        categoryName: c.categoryName || 'Hạng phòng',
        name: c.categoryName || 'Hạng phòng',
        revenue: Number(c.revenue || 0),
        value: Number(c.revenue || 0),
        percentage: Number(c.percentage || 0),
        bookingCount: Number(c.bookingCount || 0),
      }));

      // Kiểm tra dữ liệu rỗng
      const isEmpty =
        metrics.totalRevenue === 0 &&
        metrics.completedBookings === 0 &&
        timeline.length === 0 &&
        roomTypes.length === 0;

      if (isEmpty) {
        setHasData(false);
        setReportData(null);
      } else {
        setHasData(Boolean(data.hasData ?? true));
        setReportData({
          metrics,
          timeline,
          roomTypes,
        });
      }
    } catch (err) {
      console.warn('Không thể tải dữ liệu báo cáo từ API:', err);
      setHasData(false);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, reportType]);

  // Gọi API khi mở trang hoặc khi bộ lọc thay đổi hợp lệ
  useEffect(() => {
    if (!dateError) {
      fetchReportData();
    }
  }, [fetchReportData, dateError]);

  // Tổng hợp danh sách tên loại phòng duy nhất từ API phòng & từ báo cáo
  const allCategoryNames = useMemo(() => {
    const fromReport = (reportData?.roomTypes || []).map((c) => c.categoryName).filter(Boolean);
    const combined = Array.from(new Set([...categoryOptions, ...fromReport]));
    return combined.sort();
  }, [categoryOptions, reportData]);

  // Danh sách loại phòng sau khi áp dụng lọc (nếu chọn loại phòng cụ thể)
  const filteredRoomTypes = useMemo(() => {
    const list = reportData?.roomTypes || [];
    if (selectedCategory === 'ALL') return list;
    return list.filter((c) => c.categoryName === selectedCategory);
  }, [reportData, selectedCategory]);

  // Thông tin loại phòng cụ thể đang được chọn (nếu có)
  const selectedCategoryItem = useMemo(() => {
    if (selectedCategory === 'ALL' || !reportData?.roomTypes) return null;
    return reportData.roomTypes.find((c) => c.categoryName === selectedCategory) || null;
  }, [reportData, selectedCategory]);

  // Đặt lại bộ lọc mặc định
  const handleResetFilters = () => {
    const range = getDefaultDateRange();
    setStartDate(range.start);
    setEndDate(range.end);
    setReportType('MONTHLY');
    setSelectedCategory('ALL');
  };

  // =========================================================================
  // 4. XỬ LÝ XUẤT FILE BÁO CÁO (EXCEL / PDF QUA BLOB)
  // =========================================================================
  const handleExport = async (format) => {
    if (!hasData || isExporting) return;
    setIsExportMenuOpen(false);
    setIsExporting(true);

    try {
      const fileFormat = (format || 'EXCEL').toUpperCase();
      const params = {
        startDate,
        endDate,
        reportType,
      };

      const response = await reportService.exportReport(fileFormat, params);

      // Đọc tên file từ header Content-Disposition
      const headers = response?.headers || {};
      const disposition =
        headers['content-disposition'] ||
        headers['Content-Disposition'] ||
        (headers.get ? headers.get('content-disposition') : null);

      let filename = `Bao_cao_Doanh_thu_${startDate}_${endDate}.${
        fileFormat === 'EXCEL' ? 'xlsx' : 'pdf'
      }`;

      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      // Tạo Blob từ dữ liệu nhị phân tải về
      const blobData = response?.data instanceof Blob ? response.data : new Blob([response.data || response]);
      const blob = new Blob([blobData], {
        type:
          fileFormat === 'EXCEL'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showToast(`Đã xuất file báo cáo ${fileFormat} thành công!`, 'success');
    } catch (err) {
      console.error('Lỗi khi xuất file báo cáo:', err);
      showToast(
        err?.response?.data?.message ||
          'Không thể xuất file báo cáo lúc này. Vui lòng thử lại sau.',
        'error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Toast thông báo */}
      {toast && (
        <div
          className={`fixed top-20 right-8 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 animate-fade-in text-xs font-medium max-w-md ${
            toast.type === 'error'
              ? 'bg-rose-950 text-rose-100 border-rose-800'
              : 'bg-stone-900 text-white border-stone-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={17} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. HEADER & KHU VỰC THANH LỌC (FILTER BAR)                         */}
      {/* =================================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
            • EXECUTIVE ANALYTICS • SCRUM 53
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Dashboard Báo cáo & Thống kê
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Tổng hợp dữ liệu doanh thu, phân bổ cơ cấu phòng và công suất hoạt động theo thời gian thực.
          </p>
        </div>

        {/* Thanh lọc (Từ ngày, Đến ngày, Report Type, Xem báo cáo, Export) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Ô chọn Từ ngày */}
          <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 shadow-2xs border transition-colors ${
            dateError ? 'bg-rose-50/60 border-rose-400' : 'bg-stone-50 border-stone-200/90'
          }`}>
            <span className="text-[11px] font-semibold text-stone-500 shrink-0">Từ ngày:</span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-stone-800 font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          {/* Ô chọn Đến ngày */}
          <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 shadow-2xs border transition-colors ${
            dateError ? 'bg-rose-50/60 border-rose-400' : 'bg-stone-50 border-stone-200/90'
          }`}>
            <span className="text-[11px] font-semibold text-stone-500 shrink-0">Đến ngày:</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-stone-800 font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          {/* Dropdown Report Type: Theo ngày, Theo tháng, Theo loại phòng */}
          <div className="relative">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="pl-3.5 pr-8 py-2.5 rounded-2xl border border-stone-200/90 bg-stone-50 text-xs font-semibold text-stone-800 shadow-2xs focus:outline-none focus:border-stone-900 appearance-none cursor-pointer"
            >
              <option value="DAILY">Theo ngày</option>
              <option value="MONTHLY">Theo tháng</option>
              <option value="BY_CATEGORY">Theo loại phòng</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-400">
              ▼
            </div>
          </div>

          {/* Dropdown Lọc theo Loại phòng */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`pl-3.5 pr-8 py-2.5 rounded-2xl border text-xs font-semibold shadow-2xs focus:outline-none appearance-none cursor-pointer transition-colors ${
                selectedCategory !== 'ALL'
                  ? 'border-amber-700 bg-amber-50/80 text-amber-900 focus:border-amber-800'
                  : 'border-stone-200/90 bg-stone-50 text-stone-800 focus:border-stone-900'
              }`}
            >
              <option value="ALL">Tất cả loại phòng</option>
              {allCategoryNames.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-400">
              ▼
            </div>
          </div>

          {/* Nút Export thẳng hàng với bộ lọc (Có menu chọn Excel hoặc PDF, disabled khi hasData = false) */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              disabled={!hasData || isExporting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-xs transition-all ${
                !hasData || isExporting
                  ? 'bg-stone-100 text-stone-300 border border-stone-200 cursor-not-allowed'
                  : 'bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 cursor-pointer shadow-2xs'
              }`}
            >
              {isExporting ? (
                <Loader2 size={13} className="animate-spin text-amber-600" />
              ) : (
                <Download size={13} className="text-stone-600" />
              )}
              <span>{isExporting ? 'Đang xuất file...' : 'Export'}</span>
              <ChevronDown size={13} className="text-stone-400" />
            </button>

            {/* Menu thả xuống chọn định dạng xuất file */}
            {isExportMenuOpen && hasData && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-40 animate-scale-up text-xs">
                <button
                  onClick={() => handleExport('EXCEL')}
                  className="w-full px-4 py-2.5 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  <span>Xuất file Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleExport('PDF')}
                  className="w-full px-4 py-2.5 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText size={15} className="text-rose-600" />
                  <span>Xuất file PDF (.pdf)</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {dateError && (
          <div className="w-full text-xs text-rose-600 font-semibold flex items-center gap-1.5 animate-fade-in pt-3 border-t border-rose-100">
            <AlertCircle size={14} className="shrink-0 text-rose-500" />
            <span>{dateError}</span>
          </div>
        )}
        {selectedCategory !== 'ALL' && (
          <div className="w-full flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100 text-xs animate-fade-in">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Filter size={12} className="text-amber-700" />
              <span>Đang lọc theo loại phòng:</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-300/80">
              <BedDouble size={12} className="text-amber-800" />
              <span>{selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="hover:text-rose-600 ml-1 cursor-pointer"
                title="Bỏ lọc loại phòng này"
              >
                <X size={12} />
              </button>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className="text-stone-400 hover:text-stone-700 text-[11px] underline cursor-pointer ml-1"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. TRẠNG THÁI EMPTY STATE KHI hasData = false                       */}
      {/* =================================================================== */}
      {!hasData && !isLoading ? (
        <div className="bg-white rounded-3xl p-16 border border-stone-200/90 shadow-2xs text-center flex flex-col items-center justify-center animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-stone-100 text-stone-400 flex items-center justify-center mb-4 border border-stone-200/60">
            <BarChart3 size={32} />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">
            Không có dữ liệu trong khoảng thời gian này
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
            Hệ thống không ghi nhận bất kỳ phát sinh doanh thu hay lượt đặt phòng nào trong phạm vi bộ lọc đã chọn. Hãy thử thay đổi mốc thời gian hoặc đặt lại mặc định.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Đặt lại 6 tháng gần nhất
          </button>
        </div>
      ) : (
        /* =================================================================== */
        /* 3. HIỂN THỊ BIỂU ĐỒ & BẢNG SỐ LIỆU KHI hasData = true               */
        /* =================================================================== */
        <div className="space-y-7 animate-fade-in">
          {/* Hàng 1: Bar Chart (Doanh thu phòng & Dịch vụ) + Pie Chart (Tỷ trọng theo loại phòng) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Biểu đồ 1: Bar Chart Doanh thu phòng và dịch vụ (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 block">
                      {reportType === 'BY_CATEGORY' ? 'PHÂN BỔ THEO HẠNG PHÒNG' : 'CƠ CẤU DOANH SỐ'}
                    </span>
                    <h2 className="font-serif text-lg font-bold text-stone-900">
                      {reportType === 'BY_CATEGORY'
                        ? 'Doanh thu & Số lượng theo từng Loại phòng'
                        : selectedCategory !== 'ALL'
                        ? `Doanh thu Phòng & Dịch vụ (${selectedCategory})`
                        : 'Doanh thu Phòng & Dịch vụ theo Thời gian'}
                    </h2>
                  </div>
                  <div className="text-[11px] text-stone-400 font-medium">
                    {reportType === 'BY_CATEGORY'
                      ? 'Đơn vị: VNĐ (Trục trái) & Lượt đặt (Trục phải)'
                      : 'Đơn vị: VNĐ (₫)'}
                  </div>
                </div>

                <div className="w-full pt-2">
                  {reportType === 'BY_CATEGORY' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={filteredRoomTypes}
                        margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                        <XAxis
                          dataKey="categoryName"
                          stroke="#78716C"
                          fontSize={11}
                          tickLine={false}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#0E1524"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(v) => {
                            if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)}T`;
                            if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
                            return v;
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#D97706"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(v) => `${v} đơn`}
                        />
                        <Tooltip
                          formatter={(val, name) => {
                            if (name === 'Doanh thu phòng') return [formatVND(val), name];
                            if (name === 'Lượt đặt hoàn tất') return [`${val} đơn`, name];
                            return [val, name];
                          }}
                          contentStyle={{
                            backgroundColor: '#1C1917',
                            borderColor: '#44403C',
                            borderRadius: '14px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                          }}
                          itemStyle={{ color: '#F5F5F4' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar
                          yAxisId="left"
                          dataKey="revenue"
                          name="Doanh thu phòng"
                          fill="#0E1524"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="bookingCount"
                          name="Lượt đặt hoàn tất"
                          fill="#D97706"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={reportData?.timeline || []}
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                        <XAxis
                          dataKey="label"
                          stroke="#78716C"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#78716C"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(v) => {
                            if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)}T`;
                            if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
                            return v;
                          }}
                        />
                        <Tooltip
                          formatter={(val, name) => [formatVND(val), name]}
                          contentStyle={{
                            backgroundColor: '#1C1917',
                            borderColor: '#44403C',
                            borderRadius: '14px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                          }}
                          itemStyle={{ color: '#F5F5F4' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar
                          dataKey="roomRevenue"
                          name="Doanh thu phòng"
                          fill="#0E1524"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="serviceRevenue"
                          name="Doanh thu dịch vụ"
                          fill="#8E6941"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Biểu đồ 2: Pie Chart Tỷ trọng doanh thu theo loại phòng (1/3 width) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 block">
                    PHÂN BỔ DANH MỤC
                  </span>
                  <h2 className="font-serif text-lg font-bold text-stone-900">
                    Tỷ trọng Doanh thu theo Loại phòng
                  </h2>
                </div>

                <div className="w-full relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData?.roomTypes || []}
                        dataKey="revenue"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {(reportData?.roomTypes || []).map((entry, index) => {
                          const isSelected =
                            selectedCategory === 'ALL' || selectedCategory === entry.categoryName;
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                              opacity={isSelected ? 1 : 0.25}
                              stroke={selectedCategory === entry.categoryName ? '#000000' : 'none'}
                              strokeWidth={selectedCategory === entry.categoryName ? 2 : 0}
                            />
                          );
                        })}
                      </Pie>
                      {/* Tooltip hiển thị giá trị tiền tệ và tỷ lệ % */}
                      <Tooltip
                        formatter={(value, name, item) => [
                          `${formatVND(value)} (${item?.payload?.percentage || 0}%)`,
                          name,
                        ]}
                        contentStyle={{
                          backgroundColor: '#1C1917',
                          borderColor: '#44403C',
                          borderRadius: '14px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                        }}
                        itemStyle={{ color: '#F5F5F4' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Danh sách chú giải theo màu (Nhấp để lọc nhanh loại phòng) */}
              <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs">
                {(reportData?.roomTypes || []).slice(0, 5).map((item, index) => {
                  const isSelected = selectedCategory === item.categoryName;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(isSelected ? 'ALL' : item.categoryName)
                      }
                      className={`w-full flex items-center justify-between text-[11px] p-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                        isSelected ? 'bg-amber-50 font-bold' : 'hover:bg-stone-50'
                      }`}
                      title="Nhấn để lọc theo loại phòng này"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        ></span>
                        <span
                          className={`truncate ${
                            isSelected ? 'text-amber-900 font-bold' : 'text-stone-700 font-medium'
                          }`}
                        >
                          {item.categoryName}
                        </span>
                      </div>
                      <span className="font-bold text-stone-900 shrink-0">
                        {item.percentage}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hàng 2: Line Chart (Doanh thu & Công suất phòng - Cấu hình 2 trục Y) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 block">
                  CHỈ SỐ TƯƠNG QUAN
                </span>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Tương quan Tổng Doanh thu & Công suất phòng (2 Trục Y)
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-stone-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0E1524]"></span>
                  Trục trái: Doanh thu (₫)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                  Trục phải: Công suất (%)
                </span>
              </div>
            </div>

            <div className="w-full pt-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={reportData?.timeline || []}
                  margin={{ top: 15, right: 20, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                  <XAxis
                    dataKey="label"
                    stroke="#78716C"
                    fontSize={11}
                    tickLine={false}
                  />

                  {/* Trục Y Trái: Doanh thu */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#0E1524"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => {
                      if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)}T`;
                      if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
                      return v;
                    }}
                  />

                  {/* Trục Y Phải: Công suất phòng (%) */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    stroke="#D97706"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />

                  <Tooltip
                    formatter={(val, name) => {
                      if (name.includes('Công suất')) {
                        return [`${val}%`, name];
                      }
                      return [formatVND(val), name];
                    }}
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      borderColor: '#44403C',
                      borderRadius: '14px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#F5F5F4' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {/* Đường Doanh thu kết nối trục Y trái */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalRevenue"
                    name="Tổng doanh thu"
                    stroke="#0E1524"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0E1524' }}
                    activeDot={{ r: 6 }}
                  />

                  {/* Đường Công suất phòng kết nối trục Y phải */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancyRate"
                    name="Công suất phòng (%)"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#D97706' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hàng 3: Bảng METRIC / VALUE */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="pb-4 border-b border-stone-100 mb-4">
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                BẢNG TỔNG HỢP CHỈ SỐ
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Chỉ số Hiệu suất Vận hành (Metric / Value)
              </h3>
            </div>

            <div className="w-full overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-2xs">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead>
                  <tr className="bg-stone-50/70 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    <th className="py-3 px-6">METRIC</th>
                    <th className="py-3 px-6 text-right">VALUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {/* 1. Tổng doanh thu */}
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-stone-800 flex items-center gap-2">
                      <DollarSign size={14} className="text-amber-800" />
                      <span>Tổng doanh thu</span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-serif text-base font-bold text-stone-900">
                      {formatVND(reportData?.metrics?.totalRevenue || 0)}
                    </td>
                  </tr>

                  {/* 2. Doanh thu phòng */}
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-stone-800">
                      Doanh thu phòng
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold text-stone-900">
                      {formatVND(reportData?.metrics?.roomRevenue || 0)}
                    </td>
                  </tr>

                  {/* 3. Doanh thu dịch vụ */}
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-stone-800">
                      Doanh thu dịch vụ
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold text-stone-900">
                      {formatVND(reportData?.metrics?.serviceRevenue || 0)}
                    </td>
                  </tr>

                  {/* 4. Công suất phòng (%) */}
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-stone-800">
                      Công suất phòng (%)
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-amber-800">
                      {reportData?.metrics?.occupancyRate || 0}%
                    </td>
                  </tr>

                  {/* 5. Tổng số đơn hoàn thành */}
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-stone-800">
                      Tổng số đơn hoàn thành
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-stone-900">
                      {reportData?.metrics?.completedBookings || 0} đơn
                    </td>
                  </tr>

                  {/* 6. Loại phòng đặt nhiều nhất */}
                  <tr className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-stone-800">
                      Loại phòng đặt nhiều nhất
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold text-emerald-800 bg-emerald-50/40 rounded-xl">
                      {reportData?.metrics?.mostBookedRoomType || '—'}
                    </td>
                  </tr>

                  {/* 7. Thông số chi tiết nếu đang lọc theo một loại phòng cụ thể */}
                  {selectedCategory !== 'ALL' && selectedCategoryItem && (
                    <>
                      <tr className="bg-amber-50/60 hover:bg-amber-50/80 transition-colors border-t-2 border-amber-300">
                        <td className="py-3.5 px-6 font-bold text-amber-900 flex items-center gap-2">
                          <BedDouble size={14} className="text-amber-800" />
                          <span>Doanh thu riêng loại phòng "{selectedCategory}"</span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-serif text-base font-bold text-amber-900">
                          {formatVND(selectedCategoryItem.revenue)}
                        </td>
                      </tr>
                      <tr className="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                        <td className="py-3 px-6 font-semibold text-stone-700 pl-10">
                          ↳ Số đơn hoàn tất ({selectedCategory})
                        </td>
                        <td className="py-3 px-6 text-right font-bold text-stone-900">
                          {selectedCategoryItem.bookingCount} đơn
                        </td>
                      </tr>
                      <tr className="bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                        <td className="py-3 px-6 font-semibold text-stone-700 pl-10">
                          ↳ Tỷ trọng trong tổng doanh thu khách sạn
                        </td>
                        <td className="py-3 px-6 text-right font-bold text-amber-800">
                          {selectedCategoryItem.percentage}%
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bảng Chi tiết Doanh thu theo từng Loại phòng */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-2xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                  CHI TIẾT THEO HẠNG PHÒNG
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Thống kê Doanh thu & Lượt đặt theo từng Loại phòng
                </h3>
              </div>
              {selectedCategory !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="self-start sm:self-auto text-xs text-stone-600 hover:text-stone-900 font-semibold px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Hiển thị tất cả loại phòng
                </button>
              )}
            </div>

            <div className="w-full overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-2xs">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="bg-stone-50/70 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    <th className="py-3 px-6">LOẠI PHÒNG (ROOM CATEGORY)</th>
                    <th className="py-3 px-4 text-center">SỐ ĐƠN HOÀN TẤT</th>
                    <th className="py-3 px-6 text-right">DOANH THU (₫)</th>
                    <th className="py-3 px-6">TỶ TRỌNG (%)</th>
                    <th className="py-3 px-4 text-center">THAO TÁC LỌC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {(reportData?.roomTypes || []).map((cat, idx) => {
                    const isSelected = selectedCategory === cat.categoryName;
                    return (
                      <tr
                        key={cat.categoryName || idx}
                        className={`transition-colors ${
                          isSelected ? 'bg-amber-50/50' : 'hover:bg-stone-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-6 font-bold text-stone-900 flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                            }}
                          ></span>
                          <span className="text-xs">{cat.categoryName}</span>
                          {cat.categoryName === reportData?.metrics?.mostBookedRoomType && (
                            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                              Đặt nhiều nhất
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-stone-800">
                          {cat.bookingCount} đơn
                        </td>
                        <td className="py-3.5 px-6 text-right font-serif text-sm font-bold text-stone-900">
                          {formatVND(cat.revenue)}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden max-w-[140px]">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, cat.percentage)}%`,
                                  backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                                }}
                              ></div>
                            </div>
                            <span className="text-[11px] font-bold text-stone-700 w-12 text-right">
                              {cat.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCategory(
                                isSelected ? 'ALL' : cat.categoryName
                              )
                            }
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-900 text-white shadow-xs'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                            }`}
                          >
                            {isSelected ? 'Đang lọc' : 'Lọc loại này'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportStatisticsPage;
