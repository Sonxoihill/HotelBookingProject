export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  RECEPTIONIST: 'RECEPTIONIST',
  ADMIN: 'ADMIN',
};

export const ROOM_STATUS = {
  AVAILABLE: {
    code: 'AVAILABLE',
    label: 'Trống',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
    dot: 'bg-emerald-500',
    theme: 'emerald',
  },
  OCCUPIED: {
    code: 'OCCUPIED',
    label: 'Đang sử dụng',
    color: 'bg-rose-50 text-rose-700 border-rose-200/80',
    badge: 'bg-rose-600 text-white shadow-2xs',
    dot: 'bg-rose-600',
    theme: 'rose',
  },
  DIRTY: {
    code: 'DIRTY',
    label: 'Cần dọn',
    color: 'bg-[#FDF4E7] text-amber-800 border-amber-200/80',
    badge: 'bg-[#FDF4E7] text-amber-800 border border-amber-200/70',
    dot: 'bg-amber-500',
    theme: 'amber',
  },
  RESERVED: {
    code: 'RESERVED',
    label: 'Đã giữ',
    color: 'bg-blue-50 text-blue-700 border-blue-200/80',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200/70',
    dot: 'bg-blue-500',
    theme: 'blue',
  },
  MAINTENANCE: {
    code: 'MAINTENANCE',
    label: 'Bảo trì',
    color: 'bg-stone-100 text-stone-700 border-stone-200/80',
    badge: 'bg-stone-100 text-stone-700 border border-stone-200/70',
    dot: 'bg-stone-400',
    theme: 'stone',
  },
  // Backward compatibility alias for any existing reference to CLEANING
  CLEANING: {
    code: 'DIRTY',
    label: 'Cần dọn',
    color: 'bg-[#FDF4E7] text-amber-800 border-amber-200/80',
    badge: 'bg-[#FDF4E7] text-amber-800 border border-amber-200/70',
    dot: 'bg-amber-500',
    theme: 'amber',
  },
};

export const BOOKING_STATUS = {
  PENDING: {
    code: 'PENDING',
    label: 'Chờ xác nhận',
    color: 'bg-amber-100 text-amber-800',
  },
  CONFIRMED: {
    code: 'CONFIRMED',
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-800',
  },
  CHECKED_IN: {
    code: 'CHECKED_IN',
    label: 'Đã nhận phòng',
    color: 'bg-purple-100 text-purple-800',
  },
  CHECKED_OUT: {
    code: 'CHECKED_OUT',
    label: 'Đã trả phòng',
    color: 'bg-emerald-100 text-emerald-800',
  },
  CANCELLED: {
    code: 'CANCELLED',
    label: 'Đã hủy',
    color: 'bg-rose-100 text-rose-800',
  },
};
