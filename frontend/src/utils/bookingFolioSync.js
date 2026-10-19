// Helper đồng bộ dữ liệu Hóa đơn (Folio) và dịch vụ phát sinh giữa các màn hình Receptionist
const STORAGE_KEY = 'hotel_bookings_folio_sync';

// Danh sách 10 dịch vụ chuẩn bị sẵn fallback khi offline (kèm đơn vị tính unit)
export const PRESET_10_SERVICES = [
  {
    id: 1,
    name: 'Bữa sáng Floating Breakfast',
    price: 1450000,
    unit: 'Set / Khay',
    category: 'In-room Dining',
    description: 'Bữa sáng nổi trên mặt nước tại hồ bơi riêng kèm nước cam tươi ép & Capuchino.',
  },
  {
    id: 2,
    name: 'Set Bò Wagyu A5 Sốt Nấm Truffle',
    price: 2850000,
    unit: 'Phần / Khách',
    category: 'In-room Dining',
    description: 'Thịt bò Wagyu chuẩn A5 nhập khẩu Nhật Bản dùng kèm sốt nấm Truffle đen.',
  },
  {
    id: 3,
    name: 'Tháp Hải Sản Hoàng Gia La Mer',
    price: 3200000,
    unit: 'Tháp / 2 khách',
    category: 'In-room Dining',
    description: 'Tôm hùm Nha Trang, hàu Pháp, cua hoàng đế và sò điệp Nhật sốt bơ tỏi.',
  },
  {
    id: 4,
    name: 'Rượu Vang Chateau Margaux Grand Cru',
    price: 3800000,
    unit: 'Chai 750ml',
    category: 'Minibar',
    description: 'Vang đỏ cao cấp niên vụ 2018 vùng Bordeaux - Pháp trong minibar.',
  },
  {
    id: 5,
    name: 'Liệu Trình Massage Đá Nóng Thảo Dược',
    price: 2200000,
    unit: 'Liệu trình 90p',
    category: 'Spa & Wellness',
    description: 'Massage trị liệu toàn thân bằng đá núi lửa và tinh dầu thảo mộc hữu cơ.',
  },
  {
    id: 6,
    name: 'Trị Liệu Phục Hồi Năng Lượng Spa',
    price: 1650000,
    unit: 'Liệu trình 60p',
    category: 'Spa & Wellness',
    description: 'Bấm huyệt đả thông kinh lạc, giải tỏa mệt mỏi sau chuyến bay dài.',
  },
  {
    id: 7,
    name: 'Đưa Đón Sân Bay Maybach S680',
    price: 2500000,
    unit: 'Chuyến / 1 chiều',
    category: 'Đưa đón Maybach',
    description: 'Đưa đón riêng tư từ Sân bay Quốc tế Cam Ranh xe Mercedes-Maybach hạng sang.',
  },
  {
    id: 8,
    name: 'Tour Du Thuyền Hoàng Hôn Vịnh Biển',
    price: 4500000,
    unit: 'Tour / 2 người',
    category: 'Dịch vụ VIP',
    description: 'Thưởng ngoạn hoàng hôn trên du thuyền buồm catamaran kèm tiệc canapé & cocktail.',
  },
  {
    id: 9,
    name: 'Giặt Hấp Âu Phục Cao Cấp (Suit)',
    price: 350000,
    unit: 'Bộ',
    category: 'Giặt là Laundry',
    description: 'Giặt hấp khô chuyên dụng bảo vệ phom dáng và chất vải dạ, len cashmere cao cấp.',
  },
  {
    id: 10,
    name: 'Nước Khoáng San Pellegrino (Minibar)',
    price: 120000,
    unit: 'Chai 500ml',
    category: 'Minibar',
    description: 'Nước khoáng có gas nhập khẩu từ Ý trong minibar tủ lạnh phòng.',
  },
];

export const INITIAL_CHECKED_IN_BOOKINGS = [
  {
    id: 'BK-8821',
    code: '#BK-8821',
    roomCode: 'P1201',
    roomName: 'Grand Celestial Penthouse',
    floor: 'Tầng 12',
    guestName: 'Đỗ Minh Quân',
    guestTier: 'Black Diamond VIP',
    checkInDate: '14/10/2026',
    checkOutDate: '18/10/2026',
    stayDuration: '4 đêm • 2 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang lưu trú',
    roomCharge: 88000000, // 22.000.000 đ/đêm * 4 đêm
    deposit: 50000000,
    services: [
      {
        id: 'SRV-01',
        serviceId: 4,
        serviceName: 'Rượu Vang Chateau Margaux Grand Cru',
        unit: 'Chai 750ml',
        unitPrice: 3800000,
        quantity: 1,
        totalAmount: 3800000,
        time: '10:15 - Hôm nay',
        category: 'Minibar',
        notes: 'Khách sử dụng tại quầy minibar phòng',
      },
    ],
  },
  {
    id: 'BK-8819',
    code: '#BK-8819',
    roomCode: 'V101',
    roomName: 'Garden Sanctuary Villa',
    floor: 'Tầng Trệt',
    guestName: 'Trần Bảo Ngọc',
    guestTier: 'VIP Diamond',
    checkInDate: '13/10/2026',
    checkOutDate: '18/10/2026',
    stayDuration: '5 đêm • 4 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang lưu trú',
    roomCharge: 74000000, // 14.800.000 đ/đêm * 5 đêm
    deposit: 40000000,
    services: [
      {
        id: 'SRV-02',
        serviceId: 1,
        serviceName: 'Bữa sáng Floating Breakfast',
        unit: 'Set / Khay',
        unitPrice: 1450000,
        quantity: 2,
        totalAmount: 2900000,
        time: '09:30 - Hôm nay',
        category: 'In-room Dining',
        notes: 'Phục vụ tại hồ bơi riêng villa',
      },
    ],
  },
  {
    id: 'BK-8815',
    code: '#BK-8815',
    roomCode: 'P1202',
    roomName: 'Royal Sky Penthouse',
    floor: 'Tầng 12',
    guestName: 'Elena Rostova',
    guestTier: 'Platinum Member',
    checkInDate: '16/10/2026',
    checkOutDate: '20/10/2026',
    stayDuration: '4 đêm • 2 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang lưu trú',
    roomCharge: 98000000, // 24.500.000 đ/đêm * 4 đêm
    deposit: 50000000,
    services: [
      {
        id: 'SRV-03',
        serviceId: 7,
        serviceName: 'Đưa Đón Sân Bay Maybach S680',
        unit: 'Chuyến / 1 chiều',
        unitPrice: 2500000,
        quantity: 1,
        totalAmount: 2500000,
        time: '08:45 - Hôm nay',
        category: 'Đưa đón Maybach',
        notes: 'Đón sân bay Cam Ranh 1 chiều',
      },
    ],
  },
  {
    id: 'BK-8810',
    code: '#BK-8810',
    roomCode: 'S802',
    roomName: 'Ocean Horizon Suite',
    floor: 'Tầng 8',
    guestName: 'Liam Vanderberg',
    guestTier: 'Executive Member',
    checkInDate: '15/10/2026',
    checkOutDate: '19/10/2026',
    stayDuration: '4 đêm • 2 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang lưu trú',
    roomCharge: 34000000, // 8.500.000 đ/đêm * 4 đêm
    deposit: 20000000,
    services: [
      {
        id: 'SRV-04',
        serviceId: 5,
        serviceName: 'Liệu Trình Massage Đá Nóng Thảo Dược',
        unit: 'Liệu trình 90p',
        unitPrice: 2200000,
        quantity: 2,
        totalAmount: 4400000,
        time: 'Hôm qua, 20:30',
        category: 'Spa & Wellness',
        notes: 'Khách sử dụng tại L\'Étoile Thermal Spa',
      },
    ],
  },
  {
    id: 'BK-8798',
    code: '#BK-8798',
    roomCode: 'V102',
    roomName: 'Garden Sanctuary Villa',
    floor: 'Tầng Trệt',
    guestName: 'Bùi Hoàng Long',
    guestTier: 'Gold Member',
    checkInDate: '16/10/2026',
    checkOutDate: '22/10/2026',
    stayDuration: '6 đêm • 3 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang lưu trú',
    roomCharge: 88800000,
    deposit: 50000000,
    services: [
      {
        id: 'SRV-05',
        serviceId: 9,
        serviceName: 'Giặt Hấp Âu Phục Cao Cấp (Suit)',
        unit: 'Bộ',
        unitPrice: 350000,
        quantity: 2,
        totalAmount: 700000,
        time: 'Hôm qua, 18:00',
        category: 'Giặt là Laundry',
        notes: 'Giao trả trước 12:00 hôm nay',
      },
    ],
  },
];

// Tính toán các khoản tiền cho một đơn booking
export const calculateBookingTotals = (booking) => {
  const roomCharge = booking.roomCharge || 0;
  const services = booking.services || [];
  const serviceFee = services.reduce((sum, item) => sum + (item.totalAmount || item.unitPrice * item.quantity || 0), 0);
  const vatTax = Math.round((roomCharge + serviceFee) * 0.08); // VAT 8%
  const grandTotal = roomCharge + serviceFee + vatTax;
  const deposit = booking.deposit || 0;
  const balanceDue = grandTotal - deposit;

  return {
    ...booking,
    roomCharge,
    services,
    serviceFee,
    vatTax,
    grandTotal,
    deposit,
    balanceDue,
  };
};

export const bookingFolioSync = {
  // Lấy toàn bộ danh sách đơn đặt phòng đang CHECKED_IN
  getCheckedInBookings: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((b) => b.status === 'CHECKED_IN').map(calculateBookingTotals);
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc storage folio:', e);
    }
    return INITIAL_CHECKED_IN_BOOKINGS.map(calculateBookingTotals);
  },

  // Lấy chi tiết hóa đơn theo bookingId
  getBookingFolio: (bookingId) => {
    const list = bookingFolioSync.getCheckedInBookings();
    return list.find((b) => b.id === bookingId || b.code === bookingId || b.roomCode === bookingId) || list[0];
  },

  // Thêm dịch vụ vào đơn đặt phòng và cập nhật storage
  addServiceToBooking: (bookingId, serviceItem) => {
    const list = bookingFolioSync.getCheckedInBookings();
    const updatedList = list.map((b) => {
      if (b.id === bookingId || b.code === bookingId || b.roomCode === bookingId) {
        const currentServices = b.services || [];
        const newService = {
          id: `SRV-${Date.now().toString().slice(-4)}`,
          time: 'Vừa xong',
          ...serviceItem,
        };
        const updatedServices = [newService, ...currentServices];
        return calculateBookingTotals({
          ...b,
          services: updatedServices,
        });
      }
      return b;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Lỗi ghi storage folio:', e);
    }

    return updatedList.find((b) => b.id === bookingId || b.code === bookingId || b.roomCode === bookingId);
  },

  // Lưu toàn bộ danh sách
  saveBookings: (bookings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Lỗi lưu storage folio:', e);
    }
  },
};

export default bookingFolioSync;
