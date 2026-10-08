/**
 * Mock Data: Thông tin chi tiết phòng nghỉ phục vụ UI/UX
 * Mô phỏng dữ liệu phản hồi từ Backend API /rooms/{id}
 */
export const MOCK_ROOMS = [
  {
    id: 1,
    roomNumber: '101',
    floor: 1,
    status: 'AVAILABLE',
    basePrice: 1200000,
    averageRating: 4.8,
    totalReviews: 24,
    category: {
      id: 1,
      name: 'Deluxe Hướng Biển (Deluxe Ocean View)',
      basePrice: 1200000,
      capacity: 2,
      bedType: '1 Giường King cao cấp',
      area: 38,
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      description: 'Phòng Deluxe sang trọng với tầm nhìn hướng trọn biển xanh, ban công rộng thoáng và đầy đủ tiện nghi tiêu chuẩn 5 sao quốc tế.',
      amenities: [
        'Wi-Fi tốc độ cao miễn phí',
        'Bữa sáng Buffet cao cấp',
        'Bồn tắm ngâm thư giãn',
        'TV thông minh 55 inch',
        'Điều hòa hai chiều thông minh',
        'Két sắt an toàn',
        'Máy pha cà phê & trà miễn phí',
      ],
    },
  },
  {
    id: 2,
    roomNumber: '205',
    floor: 2,
    status: 'AVAILABLE',
    basePrice: 2400000,
    averageRating: 4.9,
    totalReviews: 18,
    category: {
      id: 2,
      name: 'Executive Suite Toàn Cảnh',
      basePrice: 2400000,
      capacity: 3,
      bedType: '1 Giường King + 1 Sofa Bed',
      area: 58,
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      description: 'Không gian Suite đẳng cấp với phòng khách riêng biệt, bồn tắm sục Jacuzzi và view toàn cảnh vịnh biển lãng mạn.',
      amenities: [
        'Wi-Fi tốc độ cao',
        'Dịch vụ quản gia 24/7',
        'Bồn sục Jacuzzi đôi',
        'Bữa sáng phục vụ tại phòng',
        'Quầy Minibar miễn phí',
      ],
    },
  },
  {
    id: 3,
    roomNumber: '310',
    floor: 3,
    status: 'AVAILABLE',
    basePrice: 1800000,
    averageRating: 4.7,
    totalReviews: 12,
    category: {
      id: 3,
      name: 'Family Garden Suite',
      basePrice: 1800000,
      capacity: 4,
      bedType: '2 Giường Queen',
      area: 65,
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
      description: 'Phòng gia đình ấm cúng với khu vườn riêng, không gian sinh hoạt rộng rãi lý tưởng cho kỳ nghỉ gia đình.',
      amenities: [
        'Wi-Fi tốc độ cao',
        'Bếp nhỏ tiện nghi',
        'Khu vui chơi trẻ em',
        'Bữa sáng Buffet gia đình',
      ],
    },
  },
];

/**
 * Lấy chi tiết phòng theo ID từ Mock Data
 */
export const getMockRoomById = (roomId) => {
  const targetId = Number(roomId);
  const found = MOCK_ROOMS.find((r) => r.id === targetId);
  return found || null;
};
