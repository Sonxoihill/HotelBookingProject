import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Hotel,
  Key,
  Wrench,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Building2,
  Layers,
  Filter,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import roomService from '../../services/roomService';
import AddRoomModal from '../../components/admin/AddRoomModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';

export const RoomManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'warning' }

  // Filter states: tầng, trạng thái, loại phòng, tìm kiếm
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    isDeleting: false,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Tải danh sách phòng và loại phòng từ Backend API (Không dùng mock data)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Tải danh mục loại phòng để phục vụ bộ lọc và gán loại phòng
      let catList = [];
      try {
        const catRes = await roomService.getRoomCategories();
        const catData = catRes?.data || catRes;
        catList = Array.isArray(catData) ? catData : (catData?.content || catData?.items || []);
        setRoomCategories(catList);
      } catch (catErr) {
        console.warn('Chưa thể tải danh mục loại phòng:', catErr);
      }

      // 2. Tải danh sách phòng vật lý
      let roomList = [];
      try {
        const res = await roomService.getAdminRooms();
        const data = res?.data || res;
        roomList = Array.isArray(data) ? data : (data?.content || data?.items || []);
      } catch (adminRoomErr) {
        console.warn('Thử gọi fallback getRooms():', adminRoomErr);
        try {
          const fallbackRes = await roomService.getRooms({ page: 0, size: 100 });
          const fbData = fallbackRes?.data || fallbackRes;
          roomList = Array.isArray(fbData) ? fbData : (fbData?.content || fbData?.items || []);
        } catch {
          roomList = [];
        }
      }

      setRooms(Array.isArray(roomList) ? roomList : []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phòng:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể tải danh sách phòng từ máy chủ.';
      showToast(msg, 'error');
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Thêm hoặc sửa phòng vật lý
  const handleSaveRoom = async (payload) => {
    try {
      if (editingRoom?.id) {
        await roomService.updateRoom(editingRoom.id, payload);
        showToast(`Cập nhật phòng "${payload.roomNumber}" thành công!`, 'success');
      } else {
        await roomService.createRoom(payload);
        showToast(`Tạo mới phòng "${payload.roomNumber}" thành công!`, 'success');
      }
      setIsModalOpen(false);
      setEditingRoom(null);
      await fetchData();
    } catch (err) {
      console.error('Lỗi khi lưu phòng:', err);
      const status = err.response?.status || err.status;
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu phòng.';
      showToast(msg, 'error');
    }
  };

  // Mở modal xác nhận xóa
  const handleOpenDelete = (room) => {
    setDeleteModal({
      isOpen: true,
      item: room,
      isDeleting: false,
    });
  };

  // Xác nhận xóa phòng vật lý
  const handleConfirmDelete = async () => {
    const item = deleteModal.item;
    if (!item?.id) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await roomService.deleteRoom(item.id);
      showToast(`Đã xóa phòng "${item.roomNumber || item.name || item.id}" thành công!`, 'success');
      setDeleteModal({ isOpen: false, item: null, isDeleting: false });
      await fetchData();
    } catch (err) {
      console.error('Lỗi khi xóa phòng:', err);
      const status = err.response?.status || err.status;
      const msg = err.response?.data?.message || err.message || 'Không thể xóa phòng này.';
      showToast(msg, 'error');
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Trích xuất danh sách các tầng từ dữ liệu phòng thực tế
  const availableFloors = useMemo(() => {
    const floorSet = new Set();
    rooms.forEach((r) => {
      if (r.floor !== undefined && r.floor !== null) {
        const fStr = String(r.floor).replace(/\D/g, '');
        if (fStr) floorSet.add(Number(fStr));
      }
    });
    const sorted = Array.from(floorSet).sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : [1, 2, 3, 4, 5, 8, 12];
  }, [rooms]);

  // Bộ lọc theo tầng, trạng thái, loại phòng và tìm kiếm
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // 1. Lọc theo tầng
      if (selectedFloor !== 'ALL') {
        const rFloorNum = parseInt(String(r.floor).replace(/\D/g, ''), 10);
        if (rFloorNum !== Number(selectedFloor)) return false;
      }

      // 2. Lọc theo trạng thái
      if (selectedStatus !== 'ALL') {
        const rStatus = r.status?.toUpperCase();
        if (rStatus !== selectedStatus) return false;
      }

      // 3. Lọc theo loại phòng
      if (selectedCategory !== 'ALL') {
        const catId = r.roomTypeId || r.categoryId || r.category?.id;
        const catName = r.roomTypeName || r.categoryName || r.category?.name;
        if (String(catId) !== String(selectedCategory) && String(catName) !== String(selectedCategory)) {
          return false;
        }
      }

      // 4. Lọc theo từ khóa tìm kiếm
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNumber = String(r.roomNumber || r.roomCode || r.name || '').toLowerCase().includes(term);
        const matchCategory = String(r.roomTypeName || r.categoryName || r.category?.name || '').toLowerCase().includes(term);
        const matchFloor = String(r.floor || '').toLowerCase().includes(term);
        const matchDesc = String(r.description || r.viewType || '').toLowerCase().includes(term);
        if (!matchNumber && !matchCategory && !matchFloor && !matchDesc) return false;
      }

      return true;
    });
  }, [rooms, selectedFloor, selectedStatus, selectedCategory, searchTerm]);

  // Đếm nhanh trạng thái
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const dirtyCount = rooms.filter((r) => r.status === 'DIRTY').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;

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
            PHÂN HỆ CẤU HÌNH NGHỈ DƯỠNG • KHO PHÒNG VẬT LÝ
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Quản lý Buồng phòng Vật lý
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Quản lý danh sách toàn bộ phòng thực tế, số phòng, định mức tầng, trạng thái sẵn sàng đón khách và cấu hình vật tư vận hành.
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
              setEditingRoom(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ THÊM PHÒNG MỚI</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Tổng số phòng */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TỔNG SỐ PHÒNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Building2 size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {rooms.length < 10 ? '0' + rooms.length : rooms.length}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Phòng vật lý</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700"></span>
            <span>Đã khởi tạo trong cơ sở dữ liệu</span>
          </div>
        </div>

        {/* Card 2: Sẵn sàng (AVAILABLE) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              SẴN SÀNG ĐÓN KHÁCH
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Key size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-700 tracking-tight leading-tight">
            {availableCount < 10 ? '0' + availableCount : availableCount}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Phòng sạch</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Trạng thái: AVAILABLE</span>
          </div>
        </div>

        {/* Card 3: Cần dọn (DIRTY) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              CẦN DỌN DẸP
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Wrench size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-amber-800 tracking-tight leading-tight">
            {dirtyCount < 10 ? '0' + dirtyCount : dirtyCount}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Phòng chờ dọn</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Trạng thái: DIRTY</span>
          </div>
        </div>

        {/* Card 4: Bảo trì (MAINTENANCE) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              ĐANG BẢO TRÌ
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Wrench size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-rose-700 tracking-tight leading-tight">
            {maintenanceCount < 10 ? '0' + maintenanceCount : maintenanceCount}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">Phòng bảo trì</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Trạng thái: MAINTENANCE</span>
          </div>
        </div>
      </div>

      {/* 3. Bộ lọc: Theo tầng, Trạng thái, Loại phòng & Tìm kiếm */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
          <div className="flex items-center gap-2 text-stone-700">
            <Filter size={14} className="text-amber-800" />
            <span>BỘ LỌC TÌM KIẾM BUỒNG PHÒNG</span>
          </div>
          <span className="text-[11px] font-normal text-stone-400">
            Hiển thị {filteredRooms.length} / {rooms.length} phòng
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Lọc theo Tầng */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Vị trí Tầng
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 focus:outline-none focus:border-stone-900"
            >
              <option value="ALL">Tất cả các tầng</option>
              {availableFloors.map((f) => (
                <option key={f} value={f}>
                  Tầng {f}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo Trạng thái */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Trạng thái buồng phòng
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 focus:outline-none focus:border-stone-900"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="AVAILABLE">AVAILABLE - Sẵn sàng</option>
              <option value="DIRTY">DIRTY - Cần dọn dẹp</option>
              <option value="MAINTENANCE">MAINTENANCE - Bảo trì</option>
              <option value="OCCUPIED">OCCUPIED - Có khách</option>
              <option value="RESERVED">RESERVED - Đã giữ chỗ</option>
            </select>
          </div>

          {/* Lọc theo Loại phòng */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Phân loại phòng
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 focus:outline-none focus:border-stone-900"
            >
              <option value="ALL">Tất cả loại phòng</option>
              {roomCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ô tìm kiếm */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              Từ khóa tìm kiếm
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Số phòng, tầng, ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>
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
                      <span>Đang tải dữ liệu buồng phòng từ máy chủ...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Hotel size={28} className="text-stone-300" />
                      <p className="text-xs font-medium text-stone-500">
                        {searchTerm || selectedFloor !== 'ALL' || selectedStatus !== 'ALL' || selectedCategory !== 'ALL'
                          ? 'Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại.'
                          : 'Chưa có phòng vật lý nào được tạo trong hệ thống.'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingRoom(null);
                          setIsModalOpen(true);
                        }}
                        className="mt-2 text-xs font-semibold text-black underline underline-offset-4 cursor-pointer"
                      >
                        + Thêm phòng vật lý mới
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const rId = room.id;
                  const rName = room.roomNumber || room.roomCode || room.name || `Phòng #${rId}`;
                  const rCategory = room.roomTypeName || room.categoryName || room.category?.name || 'Tiêu chuẩn';
                  const rFloor = room.floor ? (String(room.floor).startsWith('Tầng') ? room.floor : `Tầng ${room.floor}`) : 'Tầng 1';
                  const rDesc = [
                    rFloor,
                    rCategory,
                    room.viewType,
                    room.bedType,
                  ]
                    .filter(Boolean)
                    .join(' • ');

                  const rPrice = room.pricePerNight || room.price || room.category?.basePrice || room.basePrice || 0;
                  const rStatus = room.status?.toUpperCase() || 'AVAILABLE';

                  return (
                    <tr key={rId} className="hover:bg-stone-50/70 transition-colors">
                      {/* Cột 1: ID */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-md border border-stone-200">
                          #{rId}
                        </span>
                      </td>

                      {/* Cột 2: NAME */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] border border-amber-200/80 text-amber-900 font-bold flex items-center justify-center text-xs">
                            {rName.replace(/\D/g, '') || rName.substring(0, 3)}
                          </div>
                          <div>
                            <p className="font-serif text-sm font-bold text-stone-900">{rName}</p>
                            <p className="text-[10px] text-stone-400 font-mono">
                              RFID: {room.rfidCode || 'RFID-STD'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cột 3: DESCRIPTION */}
                      <td className="py-4 px-6">
                        <p className="font-medium text-stone-800 text-xs">{rDesc}</p>
                        {room.notes && (
                          <p className="text-[11px] text-stone-400 italic mt-0.5 line-clamp-1">
                            {room.notes}
                          </p>
                        )}
                      </td>

                      {/* Cột 4: PRICE/UNIT */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <p className="font-serif text-sm font-bold text-stone-900">
                          {formatVND(rPrice)}
                        </p>
                        <p className="text-[9px] text-stone-400 uppercase tracking-wider mt-0.5">
                          / ĐÊM LƯU TRÚ
                        </p>
                      </td>

                      {/* Cột 5: STATUS */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {rStatus === 'AVAILABLE' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            AVAILABLE
                          </span>
                        )}
                        {rStatus === 'DIRTY' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            DIRTY (Cần dọn)
                          </span>
                        )}
                        {rStatus === 'MAINTENANCE' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            MAINTENANCE
                          </span>
                        )}
                        {rStatus === 'OCCUPIED' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            OCCUPIED (Có khách)
                          </span>
                        )}
                        {!['AVAILABLE', 'DIRTY', 'MAINTENANCE', 'OCCUPIED'].includes(rStatus) && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-600"></span>
                            {rStatus}
                          </span>
                        )}
                      </td>

                      {/* Cột 6: ACTIONS (✏️, 🗑️) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRoom(room);
                              setIsModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Chỉnh sửa buồng phòng"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(room)}
                            className="w-8 h-8 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            title="Xóa phòng vật lý"
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
            Đang quản lý <strong>{filteredRooms.length}</strong> phòng vật lý trong hệ thống PMS.
          </span>
          <span className="text-[11px] text-stone-400">
            Dữ liệu kết nối trực tiếp CSDL • Realtime API
          </span>
        </div>
      </div>

      {/* Modal Thêm / Sửa Phòng */}
      <AddRoomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRoom(null);
        }}
        onSave={handleSaveRoom}
        roomTypes={roomCategories}
        initialData={editingRoom}
      />

      {/* Modal xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, isDeleting: false })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phòng vật lý"
        message="Bạn có chắc chắn muốn xóa phòng này không? Nếu phòng đang có đơn đặt phòng hoặc khách lưu trú, hệ thống sẽ từ chối thao tác."
        itemName={deleteModal.item ? `Phòng ${deleteModal.item.roomNumber || deleteModal.item.name || deleteModal.item.id}` : ''}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default RoomManagementPage;
