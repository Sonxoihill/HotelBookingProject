import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ConciergeBell,
  Search,
  Plus,
  Edit2,
  Trash2,
  Coins,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Utensils,
  Tag,
  Clock,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import serviceService from '../../services/serviceService';
import AddServiceModal from '../../components/admin/AddServiceModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';

export const ServiceManagementPage = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'warning' | 'error' }

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    isDeleting: false,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Tải danh sách dịch vụ từ API (Xóa toàn bộ mock data)
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      let list = [];
      try {
        const res = await serviceService.getAdminServices();
        const data = res?.data || res;
        list = Array.isArray(data) ? data : (data?.content || data?.items || []);
      } catch (adminErr) {
        console.warn('Thử gọi getServices():', adminErr);
        const fbRes = await serviceService.getServices();
        const fbData = fbRes?.data || fbRes;
        list = Array.isArray(fbData) ? fbData : (fbData?.content || fbData?.items || []);
      }
      setServices(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách dịch vụ:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tải danh sách dịch vụ từ máy chủ.';
      showToast(msg, 'error');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Thêm hoặc sửa dịch vụ
  const handleSaveService = async (payload) => {
    try {
      if (editingService?.id) {
        await serviceService.updateService(editingService.id, payload);
        showToast(`Cập nhật dịch vụ "${payload.name}" thành công!`, 'success');
      } else {
        await serviceService.createService(payload);
        showToast(`Thêm mới dịch vụ "${payload.name}" thành công!`, 'success');
      }
      setIsModalOpen(false);
      setEditingService(null);
      await fetchServices();
    } catch (err) {
      console.error('Lỗi khi lưu dịch vụ:', err);
      const status = err.response?.status || err.status;
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu dịch vụ.';
      showToast(msg, 'error');
    }
  };

  // Mở modal xác nhận xóa dịch vụ
  const handleOpenDelete = (service) => {
    setDeleteModal({
      isOpen: true,
      item: service,
      isDeleting: false,
    });
  };

  // Xác nhận xóa dịch vụ
  const handleConfirmDelete = async () => {
    const item = deleteModal.item;
    if (!item?.id) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      const res = await serviceService.deleteService(item.id);
      const resMsg =
        (typeof res === 'string' ? res : (res?.message || res?.data?.message || ''));

      // Riêng trang Dịch vụ: Nếu response trả về thông báo có chuỗi "chuyển sang Ngừng hoạt động"
      // -> hiện Toast cảnh báo màu vàng, rồi gọi lại hàm tải danh sách.
      if (resMsg && resMsg.includes('chuyển sang Ngừng hoạt động')) {
        showToast(resMsg, 'warning');
      } else {
        showToast(resMsg || `Đã xóa dịch vụ "${item.name}" thành công!`, 'success');
      }

      setDeleteModal({ isOpen: false, item: null, isDeleting: false });
      await fetchServices();
    } catch (err) {
      console.error('Lỗi khi xóa dịch vụ:', err);
      const status = err.response?.status || err.status;
      const msg = err.response?.data?.message || err.message || 'Không thể xóa dịch vụ này.';

      // Bắt lỗi catch từ axios: Nếu status là 400 hoặc 409 -> hiện Toast lỗi lấy đúng nội dung backend trả về
      // Hoặc nếu backend trả về message chứa "chuyển sang Ngừng hoạt động"
      if (msg.includes('chuyển sang Ngừng hoạt động')) {
        showToast(msg, 'warning');
        setDeleteModal({ isOpen: false, item: null, isDeleting: false });
        await fetchServices();
      } else {
        showToast(msg, 'error');
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    }
  };

  // Lọc theo danh mục và tìm kiếm
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const srvCat = srv.category || '';
      const matchCat =
        activeCategory === 'ALL' ||
        (activeCategory === 'MINIBAR' && srvCat.toLowerCase().includes('minibar')) ||
        (activeCategory === 'DINING' && (srvCat.toLowerCase().includes('dining') || srvCat.toLowerCase().includes('ẩm thực'))) ||
        (activeCategory === 'SPA' && (srvCat.toLowerCase().includes('spa') || srvCat.toLowerCase().includes('wellness'))) ||
        (activeCategory === 'TRANSPORT' && (srvCat.toLowerCase().includes('maybach') || srvCat.toLowerCase().includes('xe')));

      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        srv.name?.toLowerCase().includes(term) ||
        srv.sku?.toLowerCase().includes(term) ||
        srvCat.toLowerCase().includes(term) ||
        srv.description?.toLowerCase().includes(term);

      return matchCat && matchSearch;
    });
  }, [services, activeCategory, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-8 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-700'
              : toast.type === 'warning'
              ? 'bg-amber-800/95 text-white border-amber-600'
              : 'bg-stone-900/95 text-white border-stone-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={17} className="text-rose-400 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle size={17} className="text-amber-300 shrink-0" />
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
            DANH MỤC TIỆN ÍCH • THỰC ĐƠN & DỊCH VỤ NGHỈ DƯỠNG
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Quản lý Danh mục Dịch vụ
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Cấu hình bảng giá thực đơn ẩm thực tại phòng, minibar rượu vang, spa & wellness, đưa đón xe sang Maybach và dịch vụ bổ sung.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchServices}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => {
              setEditingService(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ THÊM DỊCH VỤ MỚI</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TỔNG SỐ DỊCH VỤ
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <ConciergeBell size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {services.length < 10 ? '0' + services.length : services.length}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Mục tiện ích</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Khả dụng cho lễ tân & khách đặt</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              ĐANG HOẠT ĐỘNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-amber-800">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {services.filter((s) => s.status === 'ACTIVE' || !s.status).length}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Đang phục vụ</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>Trạng thái: ACTIVE</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              NGỪNG HOẠT ĐỘNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Coins size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {services.filter((s) => s.status === 'INACTIVE').length}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Tạm dừng</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
            <span>Trạng thái: INACTIVE</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Tất cả ({services.length})
          </button>
          <button
            onClick={() => setActiveCategory('MINIBAR')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'MINIBAR'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Minibar & Đồ uống
          </button>
          <button
            onClick={() => setActiveCategory('DINING')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'DINING'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            In-room Dining
          </button>
          <button
            onClick={() => setActiveCategory('SPA')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'SPA'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Spa & Wellness
          </button>
          <button
            onClick={() => setActiveCategory('TRANSPORT')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'TRANSPORT'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Đưa đón Maybach
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm tên dịch vụ, mã SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Table: ID, NAME, DESCRIPTION, PRICE/UNIT, STATUS, ACTIONS (✏️, 🗑️) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/60 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-4">NAME</th>
                <th className="py-3.5 px-6">DESCRIPTION</th>
                <th className="py-3.5 px-4 text-right">PRICE/UNIT</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400">
                    <div className="inline-flex items-center gap-2 text-xs">
                      <RefreshCw size={16} className="animate-spin text-stone-600" />
                      <span>Đang tải danh sách dịch vụ từ máy chủ...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ConciergeBell size={28} className="text-stone-300" />
                      <p className="text-xs font-medium text-stone-500">
                        {searchTerm || activeCategory !== 'ALL'
                          ? 'Không tìm thấy dịch vụ nào phù hợp.'
                          : 'Chưa có dịch vụ nào trong hệ thống.'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingService(null);
                          setIsModalOpen(true);
                        }}
                        className="mt-2 text-xs font-semibold text-black underline underline-offset-4 cursor-pointer"
                      >
                        + Thêm dịch vụ mới
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => {
                  const srvId = srv.id;
                  const srvName = srv.name || 'Dịch vụ';
                  const srvPrice = srv.price || 0;
                  const srvUnit = srv.unit || 'Lần';
                  const srvStatus = (srv.status || 'ACTIVE').toUpperCase();
                  const srvDesc = srv.description || srv.category || 'Dịch vụ lưu trú tiêu chuẩn';

                  return (
                    <tr key={srvId} className="hover:bg-stone-50/70 transition-colors">
                      {/* Cột 1: ID */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md border border-stone-200">
                          #{srvId}
                        </span>
                      </td>

                      {/* Cột 2: NAME */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-stone-900">{srvName}</p>
                        <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                          {srv.sku || `SKU-${srvId}`} {srv.category ? `• ${srv.category}` : ''}
                        </p>
                      </td>

                      {/* Cột 3: DESCRIPTION */}
                      <td className="py-4 px-6">
                        <p className="text-stone-700 text-xs font-medium line-clamp-2">{srvDesc}</p>
                        {srv.department && (
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Điều phối: {srv.department} {srv.slaTime ? `(${srv.slaTime})` : ''}
                          </p>
                        )}
                      </td>

                      {/* Cột 4: PRICE/UNIT */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <p className="font-bold text-stone-900 text-xs">{formatVND(srvPrice)}</p>
                        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">
                          / {srvUnit}
                        </p>
                      </td>

                      {/* Cột 5: STATUS */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {srvStatus === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            ACTIVE (Đang phục vụ)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                            INACTIVE (Ngừng hoạt động)
                          </span>
                        )}
                      </td>

                      {/* Cột 6: ACTIONS (✏️, 🗑️) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingService(srv);
                              setIsModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Chỉnh sửa dịch vụ"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(srv)}
                            className="w-8 h-8 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Xóa dịch vụ"
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
            Đang hiển thị <strong>{filteredServices.length}</strong> trên <strong>{services.length}</strong> dịch vụ trong hệ thống.
          </span>
          <span className="text-[11px] text-stone-400">
            PMS L'Étoile • Quản trị dịch vụ & Thực đơn
          </span>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        initialData={editingService}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa dịch vụ"
        message="Bạn có chắc chắn muốn xóa dịch vụ này không? Nếu dịch vụ đang phát sinh trong các đơn phòng, hệ thống sẽ chuyển sang trạng thái Ngừng hoạt động."
        itemName={deleteModal.item?.name}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default ServiceManagementPage;
