import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BadgePercent,
  TrendingUp,
  RotateCw,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Filter,
} from 'lucide-react';
import pricingService from '../../services/pricingService';
import roomService from '../../services/roomService';
import AddPricingRuleModal from '../../components/admin/AddPricingRuleModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';

export const PriceSettingPage = () => {
  const [rules, setRules] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'warning' | 'error' }

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    isDeleting: false,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper định dạng ngày dd/MM/yyyy
  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Tải danh sách quy tắc giá và loại phòng từ API (Xóa toàn bộ mock data)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Tải danh sách loại phòng để map tên loại phòng
      let catList = [];
      try {
        const catRes = await roomService.getRoomCategories();
        const catData = catRes?.data || catRes;
        catList = Array.isArray(catData) ? catData : (catData?.content || catData?.items || []);
        setRoomCategories(catList);
      } catch (catErr) {
        console.warn('Không thể tải danh sách loại phòng:', catErr);
      }

      // 2. Tải danh sách quy tắc giá
      let ruleList = [];
      try {
        const res = await pricingService.getPricingRules();
        const data = res?.data || res;
        ruleList = Array.isArray(data) ? data : (data?.content || data?.items || []);
      } catch (ruleErr) {
        console.warn('Lỗi khi gọi getPricingRules:', ruleErr);
        ruleList = [];
      }

      setRules(Array.isArray(ruleList) ? ruleList : []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu bảng giá:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tải danh sách quy tắc giá.';
      showToast(msg, 'error');
      setRules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Thêm mới hoặc Cập nhật quy tắc giá
  const handleSaveRule = async (payload) => {
    if (editingRule?.id) {
      await pricingService.updatePricingRule(editingRule.id, payload);
      showToast(`Cập nhật quy tắc "${payload.name}" thành công!`, 'success');
    } else {
      await pricingService.createPricingRule(payload);
      showToast(`Tạo mới quy tắc "${payload.name}" thành công!`, 'success');
    }
    setIsModalOpen(false);
    setEditingRule(null);
    await fetchData();
  };

  // Mở modal xác nhận xóa
  const handleOpenDelete = (rule) => {
    setDeleteModal({
      isOpen: true,
      item: rule,
      isDeleting: false,
    });
  };

  // Xác nhận xóa
  const handleConfirmDelete = async () => {
    const item = deleteModal.item;
    if (!item?.id) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await pricingService.deletePricingRule(item.id);
      showToast(`Đã xóa quy tắc giá "${item.name}" thành công!`, 'success');
      setDeleteModal({ isOpen: false, item: null, isDeleting: false });
      await fetchData();
    } catch (err) {
      console.error('Lỗi khi xóa quy tắc giá:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể xóa quy tắc giá này.';
      showToast(msg, 'error');
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Helper render badge loại quy tắc
  const renderTypeBadge = (ruleType) => {
    const typeStr = String(ruleType || '').toUpperCase();
    if (typeStr.includes('WEEKEND') || typeStr.includes('CUỐI TUẦN')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          Cuối tuần
        </span>
      );
    }
    if (typeStr.includes('HOLIDAY') || typeStr.includes('LỄ')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          Lễ Tết
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        Mùa cao điểm
      </span>
    );
  };

  // Lọc quy tắc
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      // Lọc theo loại
      if (selectedTypeFilter !== 'ALL') {
        const typeStr = String(r.ruleType || r.type || '').toUpperCase();
        if (!typeStr.includes(selectedTypeFilter)) return false;
      }

      // Lọc theo từ khóa
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = String(r.name || '').toLowerCase().includes(term);
        const matchType = String(r.ruleType || r.type || '').toLowerCase().includes(term);
        if (!matchName && !matchType) return false;
      }

      return true;
    });
  }, [rules, selectedTypeFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-8 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-700'
              : toast.type === 'warning'
              ? 'bg-amber-900/95 text-white border-amber-700'
              : 'bg-stone-900/95 text-white border-stone-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={17} className="text-rose-400 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle size={17} className="text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
            CẤU HÌNH TỐI ƯU DOANH THU • YIELD MANAGEMENT RMS
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Cài đặt Giá linh hoạt
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Thiết lập chính sách giá động theo mùa cao điểm, ngày lễ tết và cuối tuần nhằm tối ưu doanh thu buồng phòng.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => {
              setEditingRule(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ THÊM QUY TẮC MỚI</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TỔNG SỐ QUY TẮC
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <SlidersHorizontal size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {rules.length < 10 ? '0' + rules.length : rules.length}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Chính sách giá</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700"></span>
            <span>Dữ liệu kết nối trực tiếp CSDL</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              ĐANG KÍCH HOẠT
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-700 tracking-tight leading-tight">
            {rules.filter((r) => r.isActive !== false).length < 10
              ? '0' + rules.filter((r) => r.isActive !== false).length
              : rules.filter((r) => r.isActive !== false).length}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Quy tắc đang chạy</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Tự động áp dụng khi báo giá</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TẠM DỪNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <BadgePercent size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {rules.filter((r) => r.isActive === false).length < 10
              ? '0' + rules.filter((r) => r.isActive === false).length
              : rules.filter((r) => r.isActive === false).length}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Tạm tắt</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
            <span>Không tác động đến giá đặt phòng</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedTypeFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedTypeFilter === 'ALL'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Tất cả ({rules.length})
          </button>
          <button
            onClick={() => setSelectedTypeFilter('WEEKEND')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedTypeFilter === 'WEEKEND'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Cuối tuần
          </button>
          <button
            onClick={() => setSelectedTypeFilter('HOLIDAY')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedTypeFilter === 'HOLIDAY'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Lễ Tết
          </button>
          <button
            onClick={() => setSelectedTypeFilter('PEAK')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedTypeFilter === 'PEAK'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Mùa cao điểm
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm theo tên quy tắc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3.5 pr-3 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Bảng danh sách quy tắc: Tên, Loại (badge màu), Thời gian (dd/MM/yyyy – dd/MM/yyyy), Mức điều chỉnh (+20% màu đỏ, -10% màu xanh), Loại phòng, Trạng thái, Thao tác */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/60 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                <th className="py-3.5 px-6">TÊN QUY TẮC</th>
                <th className="py-3.5 px-4 text-center">LOẠI</th>
                <th className="py-3.5 px-4">THỜI GIAN ÁP DỤNG</th>
                <th className="py-3.5 px-4 text-center">MỨC ĐIỀU CHỈNH</th>
                <th className="py-3.5 px-4">LOẠI PHÒNG</th>
                <th className="py-3.5 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-400">
                    <div className="inline-flex items-center gap-2 text-xs">
                      <RefreshCw size={16} className="animate-spin text-stone-600" />
                      <span>Đang tải danh sách quy tắc giá từ máy chủ...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                /* Khi mảng dữ liệu rỗng -> hiện "Chưa có quy tắc giá nào" kèm nút "Thêm quy tắc mới" */
                <tr>
                  <td colSpan="7" className="py-14 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                        <BadgePercent size={24} />
                      </div>
                      <p className="text-xs font-semibold text-stone-600">
                        Chưa có quy tắc giá nào
                      </p>
                      <p className="text-[11px] text-stone-400 max-w-sm">
                        Hãy thiết lập quy tắc giá động đầu tiên cho các dịp lễ tết, cuối tuần hoặc mùa cao điểm.
                      </p>
                      <button
                        onClick={() => {
                          setEditingRule(null);
                          setIsModalOpen(true);
                        }}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer shadow-xs transition-colors"
                      >
                        <Plus size={14} />
                        <span>Thêm quy tắc mới</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => {
                  const percent = Number(rule.adjustmentPercent ?? rule.percentage ?? 0);
                  const isPositive = percent > 0;
                  const isNegative = percent < 0;

                  // Loại phòng áp dụng
                  const catId = rule.categoryId;
                  const matchedCat = roomCategories.find((c) => String(c.id) === String(catId));
                  const categoryDisplay = catId
                    ? (rule.categoryName || matchedCat?.name || `Loại phòng #${catId}`)
                    : 'Tất cả loại phòng';

                  const timeRangeStr = `${formatDateVN(rule.startDate)} – ${formatDateVN(rule.endDate)}`;

                  return (
                    <tr key={rule.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Cột 1: Tên */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-stone-900">{rule.name}</p>
                        {rule.description && (
                          <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                            {rule.description}
                          </p>
                        )}
                      </td>

                      {/* Cột 2: Loại (badge màu) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {renderTypeBadge(rule.ruleType || rule.type)}
                      </td>

                      {/* Cột 3: Thời gian (dd/MM/yyyy – dd/MM/yyyy) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-stone-800">
                          <Calendar size={13} className="text-stone-400 shrink-0" />
                          <span>{timeRangeStr}</span>
                        </div>
                      </td>

                      {/* Cột 4: Mức điều chỉnh (+20% màu đỏ, -10% màu xanh) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {isPositive ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200">
                            +{percent}%
                          </span>
                        ) : isNegative ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
                            {percent}%
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200">
                            0%
                          </span>
                        )}
                      </td>

                      {/* Cột 5: Loại phòng */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                            !catId
                              ? 'bg-stone-100 text-stone-700 border-stone-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200/70'
                          }`}
                        >
                          {categoryDisplay}
                        </span>
                      </td>

                      {/* Cột 6: Trạng thái */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {rule.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Kích hoạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                            Tạm dừng
                          </span>
                        )}
                      </td>

                      {/* Cột 7: Thao tác (✏️, 🗑️) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRule(rule);
                              setIsModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Chỉnh sửa quy tắc giá"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(rule)}
                            className="w-8 h-8 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Xóa quy tắc giá"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>
            Đang áp dụng <strong>{filteredRules.length}</strong> quy tắc định giá trong hệ thống PMS.
          </span>
          <span className="text-[11px] text-stone-400">
            Yield Management • Quản lý giá động
          </span>
        </div>
      </div>

      {/* Modal Thêm / Sửa Quy tắc giá */}
      <AddPricingRuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        roomCategories={roomCategories}
        initialData={editingRule}
      />

      {/* Modal xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa quy tắc giá"
        message="Bạn có chắc chắn muốn xóa quy tắc định giá này không? Đơn giá các phòng trong khoảng thời gian này sẽ trở về mức giá tiêu chuẩn."
        itemName={deleteModal.item?.name}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default PriceSettingPage;
