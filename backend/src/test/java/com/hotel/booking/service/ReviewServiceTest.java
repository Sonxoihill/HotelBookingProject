package com.hotel.booking.service;

import com.hotel.booking.dto.review.CreateReviewRequest;
import com.hotel.booking.dto.review.ReviewResponse;
import com.hotel.booking.dto.review.RoomReviewsSummaryResponse;
import com.hotel.booking.entity.Review;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private User sampleUser;
    private Room sampleRoom;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .email("customer@hotel.com")
                .fullName("Nguyễn Văn A")
                .build();
        sampleUser.setId(1L);

        sampleRoom = Room.builder()
                .roomNumber("101")
                .build();
        sampleRoom.setId(101L);
    }

    @Test
    @DisplayName("createReview (SCRUM-91) - Tự động escape chuỗi khi chứa mã độc script XSS")
    void testCreateReview_EscapeXssScript() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setRoomId(101L);
        request.setRating(5);
        request.setComment("<script>alert('xss')</script>");

        when(userRepository.findByEmail("customer@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(roomRepository.findById(101L)).thenReturn(Optional.of(sampleRoom));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId(1L);
            review.setCreatedAt(LocalDateTime.now());
            return review;
        });

        ReviewResponse response = reviewService.createReview("customer@hotel.com", request);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        Review savedEntity = captor.getValue();

        // Kiểm tra trong Entity được lưu đã tự động escape HTML
        assertNotNull(savedEntity.getComment());
        assertFalse(savedEntity.getComment().contains("<script>"), "Comment lưu vào DB không được chứa thẻ <script> nguyên bản");
        assertTrue(savedEntity.getComment().contains("&lt;script&gt;"), "Thẻ <script> phải được escape thành &lt;script&gt;");

        // Kiểm tra DTO response trả về
        assertNotNull(response.getComment());
        assertFalse(response.getComment().contains("<script>"));
        assertTrue(response.getComment().contains("&lt;script&gt;"));
    }

    @Test
    @DisplayName("getReviewsByRoomId (SCRUM-91) - Escape dữ liệu chưa escape trong database để chống XSS")
    void testGetReviewsByRoomId_EscapeLegacyUnescapedReview() {
        Review legacyReview = Review.builder()
                .id(2L)
                .user(sampleUser)
                .room(sampleRoom)
                .rating(4)
                .comment("<img src=x onerror=alert('xss')>")
                .createdAt(LocalDateTime.now())
                .build();

        when(reviewRepository.findByRoomIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(legacyReview));

        RoomReviewsSummaryResponse summary = reviewService.getReviewsByRoomId(101L);

        assertNotNull(summary);
        assertEquals(1, summary.getReviews().size());
        String responseComment = summary.getReviews().get(0).getComment();
        assertFalse(responseComment.contains("<img"), "Không được chứa thẻ HTML thô");
        assertTrue(responseComment.contains("&lt;img"), "Thẻ HTML thô phải được escape an toàn");
    }
}
