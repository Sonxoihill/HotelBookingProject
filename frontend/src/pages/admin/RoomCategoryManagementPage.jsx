import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  BedDouble,
  Maximize2,
  Coins,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Building2,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import roomService from '../../services/roomService';
import AddRoomTypeModal from '../../components/admin/AddRoomTypeModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';

export const RoomCategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'warning', message: string }

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    isDeleting: false,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Tải danh sách loại phòng từ Backend API
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await roomService.getRoomCategories();
      const data = res?.data || res;
      const list = Array.isArray(data)
        ? data
        : (data?.content || data?.items || []);
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách loại phòng:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tải danh sách loại phòng từ máy chủ.';
      showToast(msg, 'error');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Thêm hoặc sửa loại phòng
  const handleSaveCategory = async (payload) => {
    try {
      if (editingCategory?.id) {
        await roomService.updateRoomCategory(editingCategory.id, payload);
        showToast(`Cập nhật loại phòng "${payload.name}" thành công!`, 'success');
      } else {
        await roomService.createRoomCategory(payload);
        showToast(`Thêm mới loại phòng "${payload.name}" thành công!`, 'success');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi khi lưu loại phòng:', err);
      const status = err.response?.status || err.status;
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu loại phòng.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Mở modal xóa
  const handleOpenDelete = (category) => {
    setDeleteModal({
      isOpen: true,
      item: category,
      isDeleting: false,
    });
  };

  // Xác nhận xóa
  const handleConfirmDelete = async () => {
    const item = deleteModal.item;
    if (!item?.id) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await roomService.deleteRoomCategory(item.id);
      showToast(`Đã xóa loại phòng "${item.name}" thành công!`, 'success');
      setDeleteModal({ isOpen: false, item: null, isDeleting: false });
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi khi xóa loại phòng:', err);
      const status = err.response?.status || err.status;
      const msg = err.response?.data?.message || err.message || 'Không thể xóa loại phòng này.';
      showToast(msg, 'error');
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Lọc tìm kiếm
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
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
            PHÂN HỆ CẤU HÌNH NGHỈ DƯỠNG • DANH MỤC HẠNG PHÒNG
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Quản lý Loại phòng & Phân hạng
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Cấu hình phân hạng phòng, giá niêm yết cơ bản, định mức sức chứa, số giường và diện tích tiêu chuẩn trong khu nghỉ dưỡng.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchCategories}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ THÊM LOẠI PHÒNG</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TỔNG SỐ LOẠI PHÒNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Layers size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {categories.length < 10 ? '0' + categories.length : categories.length}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Phân hạng lưu trú</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Dữ liệu đồng bộ trực tiếp từ máy chủ</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              ĐỊNH GIÁ TRUNG BÌNH
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-amber-800">
              <Coins size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {categories.length > 0
              ? formatVND(
                  Math.round(
                    categories.reduce((acc, c) => acc + Number(c.basePrice || c.price || 0), 0) /
                      categories.length
                  )
                )
              : '0 VND'}
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>Mức giá cơ bản chưa gồm phụ phí</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              SỨC CHỨA TỐI ĐA
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Users size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {categories.length > 0
              ? Math.max(...categories.map((c) => Number(c.capacity || c.maxGuests || 2)))
              : 0}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Khách / phòng lớn</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Đạt chuẩn tiêu chuẩn lưu trú 5 sao</span>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên loại phòng, mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>

        <div className="text-xs text-stone-500">
          Hiển thị <strong>{filteredCategories.length}</strong> trên <strong>{categories.length}</strong> loại phòng
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/60 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                <th className="py-3.5 px-6">TÊN</th>
                <th className="py-3.5 px-4 text-right">GIÁ CƠ BẢN</th>
                <th className="py-3.5 px-4 text-center">SỨC CHỨA</th>
                <th className="py-3.5 px-4 text-center">SỐ GIƯỜNG</th>
                <th className="py-3.5 px-4 text-center">DIỆN TÍCH</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400">
                    <div className="inline-flex items-center gap-2 text-xs">
                      <RefreshCw size={16} className="animate-spin text-stone-600" />
                      <span>Đang tải danh sách loại phòng từ máy chủ...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 size={28} className="text-stone-300" />
                      <p className="text-xs font-medium text-stone-500">
                        {searchTerm ? 'Không tìm thấy loại phòng nào phù hợp.' : 'Chưa có loại phòng nào trong hệ thống.'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setIsModalOpen(true);
                        }}
                        className="mt-2 text-xs font-semibold text-black underline underline-offset-4 cursor-pointer"
                      >
                        + Tạo loại phòng đầu tiên
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Cột 1: TÊN */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            cat.imageUrl ||
                            cat.image ||
                            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=160&auto=format&fit=crop&q=80'
                          }
                          alt={cat.name}
                          className="w-14 h-12 rounded-xl object-cover ring-1 ring-stone-200 shrink-0 shadow-2xs"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=160&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-serif text-sm font-bold text-stone-900">{cat.name}</p>
                            {cat.badge && (
                              <span className="text-[9px] font-bold tracking-wider uppercase text-amber-900 bg-[#FDF4E7] border border-amber-200/70 px-1.5 py-0.5 rounded leading-none">
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            Mã: <span className="font-mono text-stone-600 font-semibold">{cat.code || `CAT-${cat.id}`}</span>
                            {cat.category && <span> • {cat.category}</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: GIÁ CƠ BẢN */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <p className="font-serif text-sm font-bold text-stone-900">
                        {formatVND(cat.basePrice || cat.price || 0)}
                      </p>
                      <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-wider mt-0.5">
                        ĐÊM / TIÊU CHUẨN
                      </p>
                    </td>

                    {/* Cột 3: SỨC CHỨA */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full text-xs">
                        <Users size={12} className="text-stone-500" />
                        <span>{cat.capacity || cat.maxGuests || 2} Khách</span>
                      </div>
                    </td>

                    {/* Cột 4: SỐ GIƯỜNG */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-medium text-stone-700">
                        <BedDouble size={13} className="text-stone-400" />
                        <span>{cat.bedCount || cat.numberOfBeds || 1} Giường</span>
                      </div>
                      {cat.bedType && (
                        <p className="text-[10px] text-stone-400 mt-0.5 max-w-[140px] truncate mx-auto">
                          {cat.bedType}
                        </p>
                      )}
                    </td>

                    {/* Cột 5: DIỆN TÍCH */}
                    <td className="py-4 px-4 text-center whitespace-nowrap font-semibold text-stone-800">
                      <div className="inline-flex items-center gap-1">
                        <Maximize2 size={11} className="text-stone-400" />
                        <span>{cat.area ? (String(cat.area).includes('m²') ? cat.area : `${cat.area} m²`) : 'Chưa cập nhật'}</span>
                      </div>
                    </td>

                    {/* Cột 6: THAO TÁC (✏️, 🗑️) */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
                          title="Chỉnh sửa loại phòng"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(cat)}
                          className="w-8 h-8 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Xóa loại phòng"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>
            Toàn bộ {filteredCategories.length} loại phòng sẵn sàng phục vụ đặt phòng.
          </span>
          <span className="text-[11px] text-stone-400">
            Hệ thống PMS L'Étoile • Quản trị phòng nghỉ
          </span>
        </div>
      </div>

      {/* Add / Edit Room Type Modal */}
      <AddRoomTypeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        initialData={editingCategory}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa loại phòng"
        message="Bạn có chắc chắn muốn xóa loại phòng này khỏi danh mục hệ thống? Nếu đang có phòng vật lý thuộc loại này, thao tác sẽ bị từ chối."
        itemName={deleteModal.item?.name}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default RoomCategoryManagementPage;
