package com.hotel.booking.service;

import com.hotel.booking.dto.review.CreateReviewRequest;
import com.hotel.booking.dto.review.ReviewResponse;
import com.hotel.booking.dto.review.RoomReviewsSummaryResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Review;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.BookingStatus;
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

    @Test
    @DisplayName("UC07: Đánh giá thành công cho đơn đặt phòng đã CHECKED_OUT")
    void testCreateReview_Success_WithBookingId_CheckedOut() {
        Booking booking = Booking.builder()
                .user(sampleUser)
                .room(sampleRoom)
                .status(BookingStatus.CHECKED_OUT)
                .build();
        booking.setId(200L);

        CreateReviewRequest request = new CreateReviewRequest();
        request.setBookingId(200L);
        request.setRating(5);
        request.setComment("Great room and clean service");

        when(userRepository.findByEmail("customer@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(bookingRepository.findById(200L)).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId(200L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId(10L);
            review.setCreatedAt(LocalDateTime.now());
            return review;
        });

        ReviewResponse response = reviewService.createReview("customer@hotel.com", request);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        assertEquals("Great room and clean service", response.getComment());
        assertEquals(200L, response.getBookingId());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    @DisplayName("UC07: Đánh giá thất bại khi đơn chưa hoàn tất trả phòng (status != CHECKED_OUT)")
    void testCreateReview_Failure_BookingNotCheckedOut() {
        Booking booking = Booking.builder()
                .user(sampleUser)
                .room(sampleRoom)
                .status(BookingStatus.CONFIRMED)
                .build();
        booking.setId(201L);

        CreateReviewRequest request = new CreateReviewRequest();
        request.setBookingId(201L);
        request.setRating(4);

        when(userRepository.findByEmail("customer@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                reviewService.createReview("customer@hotel.com", request)
        );
        assertTrue(ex.getMessage().contains("Chỉ được đánh giá sau khi đã hoàn tất trả phòng"));
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("UC07: Đánh giá thất bại khi đơn đặt phòng đã được đánh giá trước đó (existsByBookingId)")
    void testCreateReview_Failure_BookingAlreadyReviewed() {
        Booking booking = Booking.builder()
                .user(sampleUser)
                .room(sampleRoom)
                .status(BookingStatus.CHECKED_OUT)
                .build();
        booking.setId(202L);

        CreateReviewRequest request = new CreateReviewRequest();
        request.setBookingId(202L);
        request.setRating(5);

        when(userRepository.findByEmail("customer@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(bookingRepository.findById(202L)).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId(202L)).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                reviewService.createReview("customer@hotel.com", request)
        );
        assertEquals("Đơn đặt phòng này đã được đánh giá", ex.getMessage());
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("UC07: Đánh giá thất bại khi đơn đặt phòng thuộc về người dùng khác")
    void testCreateReview_Failure_BookingNotBelongToUser() {
        User anotherUser = User.builder().email("other@hotel.com").build();
        anotherUser.setId(99L);

        Booking booking = Booking.builder()
                .user(anotherUser)
                .room(sampleRoom)
                .status(BookingStatus.CHECKED_OUT)
                .build();
        booking.setId(203L);

        CreateReviewRequest request = new CreateReviewRequest();
        request.setBookingId(203L);
        request.setRating(5);

        when(userRepository.findByEmail("customer@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(bookingRepository.findById(203L)).thenReturn(Optional.of(booking));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                reviewService.createReview("customer@hotel.com", request)
        );
        assertTrue(ex.getMessage().contains("Bạn chỉ có thể đánh giá cho đơn đặt phòng của chính mình"));
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    @DisplayName("UC07: Đánh giá thất bại khi số sao không hợp lệ (< 1 hoặc > 5)")
    void testCreateReview_Failure_InvalidRating() {
        CreateReviewRequest request = new CreateReviewRequest();
        request.setBookingId(200L);
        request.setRating(6);

        when(userRepository.findByEmail("customer@hotel.com")).thenReturn(Optional.of(sampleUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                reviewService.createReview("customer@hotel.com", request)
        );
        assertEquals("Số sao đánh giá phải từ 1 đến 5", ex.getMessage());
        verify(reviewRepository, never()).save(any(Review.class));
    }
}
