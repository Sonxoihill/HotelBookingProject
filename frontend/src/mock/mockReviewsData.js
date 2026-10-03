/**
 * Dữ liệu Mock Đánh giá (Reviews) của khách hàng
 * Dùng để test UI trước khi Backend có API đánh giá
 * Sau này khi có backend và USE_MOCK = false, có thể xóa file này theo Plan 2
 */

export const mockReviewsData = {
  1: {
    averageRating: 4.9,
    totalReviews: 8,
    reviews: [
      {
        id: 101,
        userName: 'Nguyễn Thành Long',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        comment: 'Phòng thực sự rất đẹp, rộng rãi và sạch sẽ hơn mong đợi. View nhìn ra thành phố cực kỳ thoáng đãng, giường ngủ êm ái giúp tôi có giấc ngủ rất ngon. Nhân viên phục vụ rất chu đáo!',
        createdAt: '2026-03-15T09:30:00Z',
      },
      {
        id: 102,
        userName: 'Trần Phương Thảo',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        comment: 'Không gian yên tĩnh, cách âm cực tốt. Bồn tắm nước nóng và các tiện nghi phòng tắm rất cao cấp. Buffet sáng cũng rất ngon miệng. Chắc chắn sẽ quay lại lần sau!',
        createdAt: '2026-03-12T14:15:00Z',
      },
      {
        id: 103,
        userName: 'Hoàng Minh Quân',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        comment: 'Dịch vụ chuẩn 5 sao, quy trình check-in và check-out rất nhanh. Wi-Fi tốc độ cao làm việc rất mượt. Rất đáng giá tiền.',
        createdAt: '2026-03-08T18:45:00Z',
      },
      {
        id: 104,
        userName: 'Lê Ngọc Ánh',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        rating: 4,
        comment: 'Phòng ốc sạch sẽ, thiết kế ấm cúng hiện đại. Chỉ có điều vị trí tầng cao gió hơi mạnh một chút vào buổi tối nhưng ngắm cảnh rất đẹp.',
        createdAt: '2026-02-27T11:20:00Z',
      },
    ],
  },
  2: {
    averageRating: 4.8,
    totalReviews: 6,
    reviews: [
      {
        id: 201,
        userName: 'Đặng Tuấn Anh',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        comment: 'Phòng Suite gia đình rất rộng rãi, các bé nhà mình cực thích ban công và khu vực phòng khách. Tiện nghi đầy đủ và mới.',
        createdAt: '2026-03-18T16:00:00Z',
      },
      {
        id: 202,
        userName: 'Phạm Thị Mai',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        comment: 'Trải nghiệm tuyệt vời! Giường King to rộng, chăn ga thơm tho sạch sẽ. Các bạn lễ tân luôn niềm nở chào đón.',
        createdAt: '2026-03-10T10:30:00Z',
      },
      {
        id: 203,
        userName: 'Vũ Đức Nam',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        rating: 4,
        comment: 'Chất lượng phòng tốt, đầy đủ minibar, máy sấy và két sắt an toàn. Dịch vụ dọn phòng nhanh gọn và lịch sự.',
        createdAt: '2026-03-01T08:00:00Z',
      },
    ],
  },
  default: {
    averageRating: 4.85,
    totalReviews: 5,
    reviews: [
      {
        id: 901,
        userName: 'Bùi Gia Huy',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        comment: 'Phòng cực kỳ tinh tế, ánh sáng tự nhiên ngập tràn vào buổi sáng. Mọi chi tiết từ nội thất gỗ đến đèn trang trí đều rất cao cấp.',
        createdAt: '2026-03-20T15:00:00Z',
      },
      {
        id: 902,
        userName: 'Đỗ Thùy Trang',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        comment: 'Kỳ nghỉ trọn vẹn và đáng nhớ cùng gia đình. Trẻ em rất thích không gian rộng rãi. Đồ ăn sáng ngon miệng và đa dạng món.',
        createdAt: '2026-03-14T09:15:00Z',
      },
      {
        id: 903,
        userName: 'Ngô Quốc Bảo',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        rating: 4,
        comment: 'Vị trí thuận tiện, phòng sạch sẽ và yên tĩnh. Cảm ơn khách sạn đã hỗ trợ gia đình tôi nhận phòng sớm 1 tiếng.',
        createdAt: '2026-03-05T12:00:00Z',
      },
    ],
  },
};

/**
 * Lấy danh sách đánh giá mẫu theo roomId
 */
export const getMockReviewsByRoomId = (roomId) => {
  const data = mockReviewsData[roomId] || mockReviewsData.default;
  return JSON.parse(JSON.stringify(data));
};
