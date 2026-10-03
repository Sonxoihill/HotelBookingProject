/**
 * Dữ liệu Mock Danh sách phòng & Chi tiết phòng (Gallery, Tiện nghi, Sức chứa)
 * Dùng để test UI trước khi Backend có API
 * Sau này khi có backend và USE_MOCK = false, có thể xóa file này theo Plan 2
 */

export const mockRoomsData = [
  {
    id: 1,
    roomNumber: '101',
    floor: 1,
    status: 'AVAILABLE',
    category: {
      id: 1,
      name: 'Deluxe Suite Hướng Biển',
      basePrice: 1850000,
      capacity: 2,
      area: 45,
      bedType: '1 Giường King đôi',
      description: 'Phòng Deluxe Suite đẳng cấp với không gian thoáng đãng, ban công đón trọn làn gió mát lành và bình minh rực rỡ. Trang bị đầy đủ nội thất sang trọng, bồn tắm nằm cao cấp và hệ thống âm thanh giải trí hiện đại.',
      amenities: 'Wi-Fi tốc độ cao, Bữa sáng Buffet, Điều hòa 2 chiều, Bồn tắm nằm Jacuzzi, TV thông minh 55 inch, Két sắt an toàn, Máy pha cà phê Nespresso, Minibar miễn phí',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      images: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 2,
    roomNumber: '202',
    floor: 2,
    status: 'AVAILABLE',
    category: {
      id: 2,
      name: 'Executive Family Suite',
      basePrice: 2800000,
      capacity: 4,
      area: 68,
      bedType: '2 Giường Queen đôi',
      description: 'Không gian nghỉ dưỡng lý tưởng dành riêng cho gia đình hoặc nhóm bạn. Sở hữu 2 phòng ngủ biệt lập kết nối cùng phòng khách trang nhã, ban công rộng ngắm hoàng hôn lãng mạn.',
      amenities: 'Wi-Fi tốc độ cao, Bữa sáng Buffet gia đình, Điều hòa 2 chiều, Phòng khách riêng biệt, Bồn tắm & Vòi sen đứng, TV 4K 65 inch, Két sắt bảo mật, Bàn làm việc cao cấp',
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      images: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 3,
    roomNumber: '305',
    floor: 3,
    status: 'AVAILABLE',
    category: {
      id: 3,
      name: 'Presidential Royal Suite',
      basePrice: 5200000,
      capacity: 2,
      area: 95,
      bedType: '1 Giường Super King Hoàng Gia',
      description: 'Tuyệt tác kiến trúc sang trọng bậc nhất của khách sạn, đem lại đặc quyền nghỉ dưỡng thượng lưu với tầm nhìn panorama 360 độ, quản gia riêng 24/7 và quầy bar rượu vang tinh tế.',
      amenities: 'Wi-Fi tốc độ cao, Bữa sáng phục vụ tại phòng, Điều hòa trung tâm, Bồn tắm sục Jacuzzi đôi, TV OLED 75 inch, Quầy bar riêng, Két sắt an toàn, Quản gia riêng phục vụ',
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      images: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 4,
    roomNumber: '401',
    floor: 4,
    status: 'AVAILABLE',
    category: {
      id: 4,
      name: 'Superior Double Room',
      basePrice: 1200000,
      capacity: 2,
      area: 32,
      bedType: '1 Giường đôi tiêu chuẩn',
      description: 'Lựa chọn tinh gọn và hiện đại cho các chuyến công tác hoặc kỳ nghỉ ngắn ngày. Đầy đủ tiện ích phục vụ công việc và thư giãn với chi phí tối ưu nhất.',
      amenities: 'Wi-Fi tốc độ cao, Điều hòa 2 chiều, Vòi sen áp lực cao, TV thông minh 43 inch, Bàn làm việc, Két sắt, Trà & Cà phê miễn phí',
      imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      images: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    },
  },
];

export const getMockRooms = () => JSON.parse(JSON.stringify(mockRoomsData));

export const getMockRoomById = (id) => {
  const room = mockRoomsData.find((r) => String(r.id) === String(id));
  return room ? JSON.parse(JSON.stringify(room)) : null;
};
