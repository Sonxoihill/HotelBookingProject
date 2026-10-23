package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.receptionist.RoomGridResponse;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.ReceptionistService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReceptionistController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReceptionistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockBean
    private ReceptionistService receptionistService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /receptionist/rooms/grid (UC09) - Lấy sơ đồ phòng thành công trả về HTTP 200")
    void testGetRoomGrid_Success() throws Exception {
        RoomGridResponse room1 = RoomGridResponse.builder()
                .id(1L)
                .roomNumber("101")
                .floor(1)
                .status(RoomStatus.AVAILABLE)
                .statusLabel("Trống")
                .categoryName("Standard Single")
                .basePrice(new BigDecimal("500000"))
                .capacity(1)
                .build();

        RoomGridResponse room2 = RoomGridResponse.builder()
                .id(2L)
                .roomNumber("102")
                .floor(1)
                .status(RoomStatus.OCCUPIED)
                .statusLabel("Đang có khách")
                .categoryName("Standard Single")
                .bookingId(100L)
                .bookingStatus(BookingStatus.CHECKED_IN)
                .guestName("Nguyễn Văn Khách")
                .actualCheckIn(LocalDateTime.now())
                .checkOut(LocalDate.now().plusDays(2))
                .notes("Khách VIP yêu cầu phòng yên tĩnh")
                .build();

        when(receptionistService.getRoomGrid(null, null)).thenReturn(List.of(room1, room2));

        mockMvc.perform(get("/receptionist/rooms/grid")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].roomNumber").value("101"))
                .andExpect(jsonPath("$.data[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$.data[1].roomNumber").value("102"))
                .andExpect(jsonPath("$.data[1].guestName").value("Nguyễn Văn Khách"))
                .andExpect(jsonPath("$.data[1].bookingStatus").value("CHECKED_IN"));
    }

    @Test
    @DisplayName("GET /receptionist/rooms/grid (UC09) - Có query param floor và status")
    void testGetRoomGrid_WithFilterParams() throws Exception {
        RoomGridResponse roomDirty = RoomGridResponse.builder()
                .id(4L)
                .roomNumber("202")
                .floor(2)
                .status(RoomStatus.DIRTY)
                .statusLabel("Cần dọn")
                .categoryName("Deluxe Double")
                .build();

        when(receptionistService.getRoomGrid(2, RoomStatus.DIRTY)).thenReturn(List.of(roomDirty));

        mockMvc.perform(get("/receptionist/rooms/grid")
                        .param("floor", "2")
                        .param("status", "DIRTY")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].roomNumber").value("202"))
                .andExpect(jsonPath("$.data[0].status").value("DIRTY"));
    }

    @Test
    @DisplayName("PATCH /receptionist/rooms/{roomId}/clean (UC12) - Dọn phòng thành công từ DIRTY sang AVAILABLE")
    void testCleanRoom_Success() throws Exception {
        RoomCategory category = RoomCategory.builder()
                .name("Standard Single")
                .basePrice(new BigDecimal("500000"))
                .build();

        Room cleanedRoom = Room.builder()
                .roomNumber("104")
                .floor(1)
                .status(RoomStatus.AVAILABLE)
                .category(category)
                .build();
        cleanedRoom.setId(7L);

        when(receptionistService.cleanRoom(7L)).thenReturn(cleanedRoom);

        mockMvc.perform(patch("/receptionist/rooms/{roomId}/clean", 7L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Xác nhận đã dọn phòng thành công"))
                .andExpect(jsonPath("$.data.id").value(7))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));
    }

    @Test
    @DisplayName("PATCH /receptionist/rooms/{roomId}/clean (UC12) - Báo lỗi 400 khi phòng không ở trạng thái DIRTY")
    void testCleanRoom_NotDirty_Returns400() throws Exception {
        when(receptionistService.cleanRoom(1L))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Phòng không ở trạng thái Cần dọn"));

        mockMvc.perform(patch("/receptionist/rooms/{roomId}/clean", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Phòng không ở trạng thái Cần dọn"));
    }

    @Test
    @DisplayName("PATCH /receptionist/rooms/{roomId}/clean (UC12) - Báo lỗi 404 khi phòng không tồn tại")
    void testCleanRoom_NotFound_Returns404() throws Exception {
        when(receptionistService.cleanRoom(999L))
                .thenThrow(new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng với ID: 999"));

        mockMvc.perform(patch("/receptionist/rooms/{roomId}/clean", 999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}
