export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  RECEPTIONIST: 'RECEPTIONIST',
  ADMIN: 'ADMIN',
};

export const ROOM_STATUS = {
  AVAILABLE: {
    code: 'AVAILABLE',
    label: 'Phòng trống',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
  },
  OCCUPIED: {
    code: 'OCCUPIED',
    label: 'Đang có khách',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500',
  },
  RESERVED: {
    code: 'RESERVED',
    label: 'Đã đặt trước',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  CLEANING: {
    code: 'CLEANING',
    label: 'Đang dọn phòng',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    dot: 'bg-blue-500',
  },
  MAINTENANCE: {
    code: 'MAINTENANCE',
    label: 'Bảo trì',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-500',
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
