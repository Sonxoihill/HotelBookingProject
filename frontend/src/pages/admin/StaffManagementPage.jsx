import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  Search,
  Lock,
  Unlock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  UserPlus,
  Loader2,
  X,
  Mail,
  Phone,
  User,
  Building2,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { staffService } from '../../services/staffService';
import { tokenStorage } from '../../utils/tokenStorage';

export const StaffManagementPage = () => {
  // =========================================================================
  // 1. STATE QUẢN LÝ TÀI KHOẢN ĐANG ĐĂNG NHẬP (ADMIN)
  // =========================================================================
  const loggedInAdmin = useMemo(() => {
    const user = tokenStorage.getUser();
    const decoded = tokenStorage.getDecodedToken();
    return {
      id: user?.id,
      email: user?.email || decoded?.sub || '',
      username: user?.username || decoded?.sub || '',
      role: tokenStorage.getUserRole(),
    };
  }, []);

  // Kiểm tra xem một dòng nhân sự có phải chính là Admin đang đăng nhập hay không
  const isSelfAccount = useCallback(
    (user) => {
      if (!user) return false;
      if (loggedInAdmin.id && user.id && String(loggedInAdmin.id) === String(user.id)) {
        return true;
      }
      if (
        loggedInAdmin.email &&
        user.email &&
        loggedInAdmin.email.toLowerCase() === user.email.toLowerCase()
      ) {
        return true;
      }
      if (
        loggedInAdmin.username &&
        user.username &&
        loggedInAdmin.username.toLowerCase() === user.username.toLowerCase()
      ) {
        return true;
      }
      return false;
    },
    [loggedInAdmin]
  );

  // =========================================================================
  // 2. STATE FORM CẤP TÀI KHOẢN MỚI (KHU VỰC TRÊN)
  // =========================================================================
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'RECEPTIONIST',
    department: 'Quầy Lễ tân',
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [emailConflictError, setEmailConflictError] = useState('');

  // =========================================================================
  // 3. STATE DANH SÁCH & TÌM KIẾM (KHU VỰC DƯỚI)
  // =========================================================================
  const [usersList, setUsersList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  // Tìm kiếm với Debounce 400ms & Lọc vai trò
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Lưu trạng thái dropdown Role được chọn trên từng dòng { [userId]: role }
  const [selectedRoles, setSelectedRoles] = useState({});
  // Lưu lỗi phân quyền trên từng dòng nếu không đổi vai trò { [userId]: errorMsg }
  const [rowErrors, setRowErrors] = useState({});
  // Trạng thái đang lưu phân quyền { [userId]: boolean }
  const [savingRowId, setSavingRowId] = useState(null);

  // Modal xác nhận Khóa / Mở khóa
  const [lockModal, setLockModal] = useState({
    isOpen: false,
    user: null,
    targetAction: 'LOCK', // 'LOCK' hoặc 'UNLOCK'
    isLoading: false,
  });

  // Toast thông báo
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // =========================================================================
  // 4. DEBOUNCE 400MS CHO Ô TÌM KIẾM
  // =========================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset về trang 1 khi từ khóa tìm kiếm thay đổi
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // =========================================================================
  // 5. TẢI DỮ LIỆU TỪ BACKEND API /admin/users (KHÔNG DÙNG MOCK DATA)
  // =========================================================================
  const fetchUsers = useCallback(async () => {
    setIsLoadingList(true);
    setListError('');
    try {
      const params = {
        page: currentPage - 1, // Spring Boot 0-indexed page
        size: pageSize,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (roleFilter !== 'ALL') {
        params.role = roleFilter;
      }

      const response = await staffService.getAllStaff(params);
      const data = response?.data || response;

      let list = [];
      let total = 0;
      let pages = 1;

      if (data && Array.isArray(data.content)) {
        // Cấu trúc phân trang Spring Page
        list = data.content;
        total = data.totalElements ?? data.content.length;
        pages = Math.max(1, data.totalPages ?? 1);
      } else if (Array.isArray(data)) {
        list = data;
        total = data.length;
        pages = Math.ceil(data.length / pageSize) || 1;
      } else if (data && Array.isArray(data.users)) {
        list = data.users;
        total = data.total ?? data.users.length;
        pages = Math.ceil(total / pageSize) || 1;
      }

      setUsersList(list);
      setTotalElements(total);
      setTotalPages(pages);

      // Khởi tạo state chọn role cho các dòng tương ứng với vai trò hiện tại
      const initialRoles = {};
      list.forEach((u) => {
        initialRoles[u.id] = u.role || 'RECEPTIONIST';
      });
      setSelectedRoles(initialRoles);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      setListError(
        err?.response?.data?.message ||
          'Không thể kết nối đến máy chủ để tải danh sách nhân sự.'
      );
      setUsersList([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [currentPage, pageSize, debouncedSearch, roleFilter]);

  // Gọi fetchUsers khi debouncedSearch, roleFilter hoặc currentPage thay đổi
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // =========================================================================
  // 6. XỬ LÝ SUBMIT FORM CẤP TÀI KHOẢN MỚI
  // =========================================================================
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setEmailConflictError('');

    if (!formData.fullName.trim() || !formData.email.trim()) {
      showToast('Vui lòng điền đầy đủ Họ và tên và Email', 'error');
      return;
    }

    setIsCreatingAccount(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        role: formData.role,
        department: formData.department,
      };

      await staffService.createStaff(payload);

      // Khi API trả về thành công:
      showToast(
        'Tạo tài khoản thành công. Mật khẩu đã được gửi tới email nhân sự',
        'success'
      );

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'RECEPTIONIST',
        department: 'Quầy Lễ tân',
      });
      setEmailConflictError('');

      // Tải lại danh sách
      fetchUsers();
    } catch (err) {
      console.error('Lỗi cấp tài khoản:', err);
      // Khi API trả về lỗi 409 (Conflict):
      if (err?.response?.status === 409 || err?.status === 409) {
        setEmailConflictError('Email đã tồn tại trong hệ thống');
      } else {
        const errorMsg =
          err?.response?.data?.message ||
          'Không thể tạo tài khoản nhân sự. Vui lòng thử lại sau.';
        showToast(errorMsg, 'error');
      }
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // =========================================================================
  // 7. XỬ LÝ THAY ĐỔI DROPDOWN ROLE TRÊN TỪNG DÒNG
  // =========================================================================
  const handleRoleSelectChange = (userId, newRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
    // Khi người dùng thay đổi lựa chọn, xóa thông báo lỗi nếu có
    if (rowErrors[userId]) {
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  };

  // =========================================================================
  // 8. XỬ LÝ SỰ KIỆN NÚT "SAVE PERMISSIONS"
  // =========================================================================
  const handleSavePermissions = async (user) => {
    if (isSelfAccount(user)) return;

    const chosenRole = selectedRoles[user.id] ?? user.role;

    // Yêu cầu: Nếu giá trị dropdown ROLE chưa đổi so với vai trò hiện tại của dòng đó
    // -> Báo lỗi ngay trên UI "Vui lòng chọn quyền hạn mới" và KHÔNG gọi API.
    if (!chosenRole || chosenRole === user.role) {
      setRowErrors((prev) => ({
        ...prev,
        [user.id]: 'Vui lòng chọn quyền hạn mới',
      }));
      return; // Dừng lại, tuyệt đối không gọi API
    }

    // Nếu đã đổi -> gọi hàm PATCH /role trong staffService.js
    setSavingRowId(user.id);
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[user.id];
      return next;
    });

    try {
      await staffService.updateStaffRole(user.id, chosenRole);
      showToast(
        `Đã phân quyền thành công cho nhân sự ${user.fullName || user.email} sang vai trò "${chosenRole}"`,
        'success'
      );

      // Cập nhật lại trong state danh sách tại client
      setUsersList((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, role: chosenRole } : item
        )
      );
    } catch (err) {
      console.error('Lỗi khi cập nhật quyền hạn:', err);
      showToast(
        err?.response?.data?.message ||
          'Cập nhật quyền hạn thất bại. Vui lòng kiểm tra quyền quản trị.',
        'error'
      );
    } finally {
      setSavingRowId(null);
    }
  };

  // =========================================================================
  // 9. XỬ LÝ SỰ KIỆN NÚT LOCK / UNLOCK VÀ HỘP THOẠI XÁC NHẬN
  // =========================================================================
  const isUserActive = (user) => {
    if (user.isActive !== undefined) return Boolean(user.isActive);
    if (user.status) return user.status === 'ACTIVE' || user.status === 'Hoạt động';
    return true; // Mặc định hoạt động
  };

  const handleOpenLockModal = (user) => {
    if (isSelfAccount(user)) return; // Không cho phép thao tác trên tài khoản Admin đang đăng nhập

    const currentlyActive = isUserActive(user);
    setLockModal({
      isOpen: true,
      user,
      targetAction: currentlyActive ? 'LOCK' : 'UNLOCK',
      isLoading: false,
    });
  };

  const handleConfirmToggleLock = async () => {
    if (!lockModal.user) return;
    const targetUser = lockModal.user;
    const isUnlocking = lockModal.targetAction === 'UNLOCK';

    setLockModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const payload = {
        isActive: isUnlocking,
        status: isUnlocking ? 'ACTIVE' : 'LOCKED',
      };

      await staffService.toggleStaffStatus(targetUser.id, payload);

      showToast(
        `Đã ${isUnlocking ? 'mở khóa' : 'khóa'} tài khoản của "${targetUser.fullName || targetUser.email}" thành công!`,
        'success'
      );

      // Cập nhật trạng thái trực tiếp trong danh sách
      setUsersList((prev) =>
        prev.map((u) => {
          if (u.id === targetUser.id) {
            return {
              ...u,
              isActive: isUnlocking,
              status: isUnlocking ? 'ACTIVE' : 'LOCKED',
            };
          }
          return u;
        })
      );

      // Đóng modal
      setLockModal({ isOpen: false, user: null, targetAction: 'LOCK', isLoading: false });
    } catch (err) {
      console.error('Lỗi khi khóa/mở khóa tài khoản:', err);
      showToast(
        err?.response?.data?.message ||
          'Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại.',
        'error'
      );
      setLockModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // =========================================================================
  // 10. TÍNH TOÁN KPI THỐNG KÊ NHÂN SỰ TỰ ĐỘNG
  // =========================================================================
  const stats = useMemo(() => {
    const total = totalElements || usersList.length;
    const activeCount = usersList.filter((u) => isUserActive(u)).length;
    const receptionistCount = usersList.filter(
      (u) => (u.role || '').toUpperCase() === 'RECEPTIONIST'
    ).length;
    const adminCount = usersList.filter(
      (u) => (u.role || '').toUpperCase() === 'ADMIN'
    ).length;

    return { total, activeCount, receptionistCount, adminCount };
  }, [usersList, totalElements]);

  return (
    <div className="space-y-8 pb-16">
      {/* =================================================================== */}
      {/* TOAST THÔNG BÁO TỔNG QUAN                                           */}
      {/* =================================================================== */}
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
          <span className="leading-snug">{toast.message}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* TIÊU ĐỀ TRANG                                                       */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
            • PHÂN HỆ QUẢN TRỊ VIÊN
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Quản lý Nhân sự & Phân quyền
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Cấp tài khoản ca trực, phân quyền vai trò nghiệp vụ (Lễ tân, Quản trị viên) và quản lý trạng thái tài khoản PMS.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={isLoadingList}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw size={13} className={isLoadingList ? 'animate-spin text-amber-700' : 'text-stone-400'} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 4 THẺ THỐNG KÊ (KPIs ĐƯỢC ĐỒNG BỘ THEO DỮ LIỆU THẬT)                */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TỔNG TÀI KHOẢN
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
              <Users size={14} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {stats.total}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">nhân sự</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>Toàn hệ thống L'Étoile</span>
            <span className="font-bold text-stone-800 text-[10px] bg-stone-100 px-1.5 py-0.5 rounded">
              HOẠT ĐỘNG
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              ĐANG HOẠT ĐỘNG
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-900 tracking-tight leading-tight">
            {stats.activeCount}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">tài khoản</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Quyền truy cập bình thường</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              LỄ TÂN (RECEPTIONIST)
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] flex items-center justify-center text-amber-800">
              <Building2 size={14} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {stats.receptionistCount}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">nhân viên</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Tiếp đón, Check-in & Rack phòng
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              QUẢN TRỊ (ADMIN)
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {stats.adminCount}{' '}
            <span className="text-sm font-normal font-sans text-stone-500">quản trị viên</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>Toàn quyền quản trị hệ thống</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. KHU VỰC CẤP TÀI KHOẢN (TRÊN)                                    */}
      {/* =================================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm transition-shadow">
        <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs shrink-0">
            <UserPlus size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
              KHU VỰC CẤP TÀI KHOẢN
            </span>
            <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight">
              Tạo tài khoản Nhân sự & Phân quyền ban đầu
            </h2>
          </div>
        </div>

        <form onSubmit={handleCreateAccount} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Họ và tên nhân sự (Full Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Thị Kim Yến"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/40 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* 2. Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Địa chỉ Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="nhansu@hotelletoile.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }));
                    if (emailConflictError) setEmailConflictError('');
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs placeholder-stone-400 focus:outline-none transition-all shadow-2xs ${
                    emailConflictError
                      ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-600'
                      : 'border-stone-200/90 bg-stone-50/40 text-stone-800 focus:border-stone-900 focus:bg-white'
                  }`}
                />
              </div>
              {/* Hiển thị lỗi 409: "Email đã tồn tại trong hệ thống" */}
              {emailConflictError && (
                <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1.5 animate-fade-in">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{emailConflictError}</span>
                </p>
              )}
            </div>

            {/* 3. Phone (Tùy chọn) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Số điện thoại (Tùy chọn)
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  placeholder="Ví dụ: 0912 345 678"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/40 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* 4. Select Role (RECEPTIONIST, ADMIN) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Quyền hạn (Select Role) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/40 text-xs font-medium text-stone-800 focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="RECEPTIONIST">RECEPTIONIST (Lễ tân ca trực)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên toàn hệ thống)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                  ▼
                </div>
              </div>
            </div>

            {/* 5. Select Department (Quầy Lễ tân, Buồng phòng, Quản lý) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Bộ phận công tác (Select Department) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, department: e.target.value }))
                  }
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/40 text-xs font-medium text-stone-800 focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="Quầy Lễ tân">Quầy Lễ tân</option>
                  <option value="Buồng phòng">Buồng phòng</option>
                  <option value="Quản lý">Quản lý</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                  ▼
                </div>
              </div>
            </div>

            {/* 6. Nút Create Account */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isCreatingAccount}
                className="w-full py-2.5 px-6 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingAccount ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-amber-400" />
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* =================================================================== */}
      {/* 3. KHU VỰC DANH SÁCH & PHÂN QUYỀN (DƯỚI)                            */}
      {/* =================================================================== */}
      <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        {/* Header Thanh công cụ: Search có debounce 400ms & Dropdown lọc Role */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/40">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Danh sách Nhân sự & Phân quyền
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Cập nhật quyền hạn theo từng tài khoản hoặc tạm khóa khi nhân sự kết thúc ca làm việc.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Dropdown lọc theo Role */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3.5 py-2 rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-700 shadow-2xs focus:outline-none focus:border-stone-900 cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="RECEPTIONIST">RECEPTIONIST (Lễ tân)</option>
              <option value="ADMIN">ADMIN (Quản trị viên)</option>
            </select>

            {/* Ô Search tìm theo tên/email có Debounce 400ms */}
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bảng Danh sách Nhân sự & Phân quyền */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                <th className="py-3.5 px-6">STAFF NAME</th>
                <th className="py-3.5 px-4">EMAIL</th>
                <th className="py-3.5 px-4">DEPARTMENT</th>
                <th className="py-3.5 px-4">ROLE (DROPDOWN)</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC / ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoadingList ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <Loader2 size={24} className="animate-spin text-amber-700" />
                      <span className="text-xs font-medium">Đang tải danh sách nhân sự từ hệ thống...</span>
                    </div>
                  </td>
                </tr>
              ) : listError ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-rose-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={22} />
                      <span className="font-semibold">{listError}</span>
                      <button
                        onClick={fetchUsers}
                        className="mt-2 px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-semibold cursor-pointer"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-14 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={28} className="text-stone-300" />
                      <span className="font-medium text-stone-600">
                        Không tìm thấy tài khoản nhân sự phù hợp
                      </span>
                      <p className="text-[11px] text-stone-400">
                        Vui lòng thử tìm kiếm với từ khóa khác hoặc sử dụng form cấp tài khoản phía trên.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                usersList.map((user) => {
                  const isSelf = isSelfAccount(user);
                  const active = isUserActive(user);
                  const currentSelectedRole = selectedRoles[user.id] ?? (user.role || 'RECEPTIONIST');
                  const isSavingRole = savingRowId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        isSelf ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* 1. STAFF NAME */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                            {(user.fullName || user.name || user.email || 'NV')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-stone-900 text-xs">
                                {user.fullName || user.name || 'Chưa cập nhật tên'}
                              </p>
                              {isSelf && (
                                <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">
                                  Bạn (Admin)
                                </span>
                              )}
                            </div>
                            {user.phone && (
                              <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                                <Phone size={10} /> {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. EMAIL */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs text-stone-700">
                          {user.email}
                        </span>
                      </td>

                      {/* 3. DEPARTMENT */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-stone-800 font-medium bg-stone-100/80 px-2.5 py-1 rounded-lg border border-stone-200/70">
                          <Building2 size={12} className="text-stone-500" />
                          <span>{user.department || 'Quầy Lễ tân'}</span>
                        </span>
                      </td>

                      {/* 4. ROLE (DROPDOWN) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="relative inline-block w-40">
                            <select
                              value={currentSelectedRole}
                              onChange={(e) =>
                                handleRoleSelectChange(user.id, e.target.value)
                              }
                              disabled={isSelf || isSavingRole}
                              className={`w-full pl-3 pr-7 py-1.5 rounded-xl border text-xs font-semibold appearance-none transition-colors ${
                                isSelf
                                  ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-80'
                                  : 'bg-white border-stone-200 text-stone-800 hover:border-stone-400 focus:outline-none focus:border-stone-900 cursor-pointer shadow-2xs'
                              }`}
                            >
                              <option value="RECEPTIONIST">RECEPTIONIST</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
                              ▼
                            </div>
                          </div>

                          {/* Ghi chú bảo vệ nếu là chính tài khoản Admin đang đăng nhập */}
                          {isSelf && (
                            <span className="text-[10px] text-amber-800/80 font-medium mt-1">
                              (Tài khoản của bạn - Không thể tự đổi)
                            </span>
                          )}

                          {/* Hiển thị lỗi ngay trên UI nếu bấm Save Permissions mà chưa đổi vai trò */}
                          {rowErrors[user.id] && (
                            <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1 animate-fade-in">
                              <AlertCircle size={11} className="shrink-0" />
                              <span>{rowErrors[user.id]}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 5. STATUS (Badge Hoạt động / Đã khóa) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {active ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Đã khóa
                          </span>
                        )}
                      </td>

                      {/* 6. THAO TÁC / ACTIONS (Save Permissions & Lock/Unlock) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {/* Nút Save Permissions */}
                          <button
                            type="button"
                            onClick={() => handleSavePermissions(user)}
                            disabled={isSelf || isSavingRole}
                            title={
                              isSelf
                                ? 'Không thể tự đổi quyền tài khoản đang đăng nhập'
                                : 'Lưu quyền hạn mới'
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isSelf
                                ? 'bg-stone-100 text-stone-300 border border-stone-200 cursor-not-allowed'
                                : 'bg-stone-900 hover:bg-black text-white cursor-pointer shadow-xs hover:shadow-sm'
                            }`}
                          >
                            {isSavingRole ? (
                              <>
                                <Loader2 size={12} className="animate-spin text-amber-400" />
                                <span>Đang lưu...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={13} />
                                <span>Save Permissions</span>
                              </>
                            )}
                          </button>

                          {/* Nút Lock / Unlock */}
                          <button
                            type="button"
                            onClick={() => handleOpenLockModal(user)}
                            disabled={isSelf}
                            title={
                              isSelf
                                ? 'Không thể tự khóa tài khoản của chính bạn'
                                : active
                                ? 'Khóa tài khoản'
                                : 'Mở khóa tài khoản'
                            }
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
                              isSelf
                                ? 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed'
                                : active
                                ? 'border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 cursor-pointer'
                                : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer'
                            }`}
                          >
                            {active ? <Lock size={13} /> : <Unlock size={13} />}
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

        {/* Thanh Phân trang (Pagination) */}
        <div className="p-4 sm:p-5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500 bg-stone-50/30">
          <div>
            Hiển thị{' '}
            <strong className="text-stone-800 font-semibold">
              {usersList.length}
            </strong>{' '}
            trong tổng số{' '}
            <strong className="text-stone-800 font-semibold">{totalElements}</strong>{' '}
            nhân sự hệ thống
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoadingList}
              className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={isLoadingList}
                className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-black text-white shadow-xs'
                    : 'border border-stone-200 text-stone-700 hover:bg-white'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoadingList}
              className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. MODAL XÁC NHẬN KHÓA / MỞ KHÓA TÀI KHOẢN                           */}
      {/* =================================================================== */}
      {lockModal.isOpen && lockModal.user && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-200 animate-scale-up">
            <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-stone-50/60">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border ${
                    lockModal.targetAction === 'LOCK'
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  {lockModal.targetAction === 'LOCK' ? (
                    <Lock size={20} />
                  ) : (
                    <Unlock size={20} />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase block">
                    XÁC NHẬN BẢO MẬT HỆ THỐNG
                  </span>
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                    {lockModal.targetAction === 'LOCK'
                      ? 'Khóa tài khoản nhân sự'
                      : 'Mở khóa tài khoản nhân sự'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() =>
                  setLockModal({
                    isOpen: false,
                    user: null,
                    targetAction: 'LOCK',
                    isLoading: false,
                  })
                }
                disabled={lockModal.isLoading}
                className="w-8 h-8 rounded-full hover:bg-stone-200/80 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Bạn có chắc chắn muốn{' '}
                <strong className="text-stone-900">
                  {lockModal.targetAction === 'LOCK' ? 'khóa' : 'mở khóa'}
                </strong>{' '}
                tài khoản của nhân viên:
              </p>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <p className="text-xs font-bold text-stone-900">
                  {lockModal.user.fullName || lockModal.user.name || 'Nhân sự'}
                </p>
                <p className="text-[11px] font-mono text-stone-500">
                  {lockModal.user.email}
                </p>
                <p className="text-[10px] font-semibold text-amber-800">
                  Vai trò: {lockModal.user.role || 'RECEPTIONIST'} • {lockModal.user.department || 'Quầy Lễ tân'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                <span>
                  {lockModal.targetAction === 'LOCK'
                    ? 'Khi tài khoản bị khóa, nhân sự sẽ không thể đăng nhập vào hệ thống PMS.'
                    : 'Sau khi mở khóa, nhân sự có thể đăng nhập bình thường với mật khẩu hiện tại.'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setLockModal({
                    isOpen: false,
                    user: null,
                    targetAction: 'LOCK',
                    isLoading: false,
                  })
                }
                disabled={lockModal.isLoading}
                className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-white cursor-pointer transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleLock}
                disabled={lockModal.isLoading}
                className={`px-5 py-2 rounded-full text-white text-xs font-semibold cursor-pointer shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 ${
                  lockModal.targetAction === 'LOCK'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-stone-900 hover:bg-black'
                }`}
              >
                {lockModal.isLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    {lockModal.targetAction === 'LOCK' ? (
                      <Lock size={13} />
                    ) : (
                      <Unlock size={13} />
                    )}
                    <span>
                      {lockModal.targetAction === 'LOCK'
                        ? 'Xác nhận Khóa'
                        : 'Xác nhận Mở khóa'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
