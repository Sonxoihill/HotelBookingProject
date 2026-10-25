package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.AdminRoomRequest;
import com.hotel.booking.dto.admin.AdminRoomResponse;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.AdminRoomService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminRoomController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminRoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockBean
    private AdminRoomService adminRoomService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /admin/rooms - Lấy danh sách phòng thành công (HTTP 200)")
    void testGetAllRooms_Success() throws Exception {
        AdminRoomResponse response = AdminRoomResponse.builder()
                .id(1L)
                .roomNumber("101")
                .floor(1)
                .status(RoomStatus.AVAILABLE)
                .categoryName("Standard Single")
                .build();

        when(adminRoomService.getAllRooms()).thenReturn(List.of(response));

        mockMvc.perform(get("/admin/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].roomNumber").value("101"));
    }

    @Test
    @DisplayName("POST /admin/rooms - Tạo phòng mới thành công (HTTP 201)")
    void testCreateRoom_Success() throws Exception {
        AdminRoomRequest request = AdminRoomRequest.builder()
                .roomNumber("501")
                .floor(5)
                .categoryId(2L)
                .status(RoomStatus.AVAILABLE)
                .build();

        AdminRoomResponse created = AdminRoomResponse.builder()
                .id(50L)
                .roomNumber("501")
                .floor(5)
                .status(RoomStatus.AVAILABLE)
                .categoryName("Deluxe Double")
                .build();

        when(adminRoomService.createRoom(any(AdminRoomRequest.class))).thenReturn(created);

        mockMvc.perform(post("/admin/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.roomNumber").value("501"));
    }

    @Test
    @DisplayName("POST /admin/rooms - Trùng số phòng trả về HTTP 409")
    void testCreateRoom_DuplicateRoomNumber() throws Exception {
        AdminRoomRequest request = AdminRoomRequest.builder()
                .roomNumber("101")
                .floor(1)
                .categoryId(1L)
                .status(RoomStatus.AVAILABLE)
                .build();

        when(adminRoomService.createRoom(any(AdminRoomRequest.class)))
                .thenThrow(new AppException(ErrorCode.CONFLICT, "Số phòng đã tồn tại"));

        mockMvc.perform(post("/admin/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Số phòng đã tồn tại"));
    }

    @Test
    @DisplayName("POST /admin/rooms - Admin đặt trạng thái không được phép (OCCUPIED) trả về HTTP 400")
    void testCreateRoom_InvalidStatus() throws Exception {
        AdminRoomRequest request = AdminRoomRequest.builder()
                .roomNumber("502")
                .floor(5)
                .categoryId(1L)
                .status(RoomStatus.OCCUPIED)
                .build();

        when(adminRoomService.createRoom(any(AdminRoomRequest.class)))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Admin chỉ được phép thiết lập trạng thái phòng là AVAILABLE, DIRTY hoặc MAINTENANCE"));

        mockMvc.perform(post("/admin/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Admin chỉ được phép thiết lập trạng thái phòng là AVAILABLE, DIRTY hoặc MAINTENANCE"));
    }

    @Test
    @DisplayName("PUT /admin/rooms/{id} - Đổi trạng thái phòng đang OCCUPIED trả về HTTP 400")
    void testUpdateRoom_OccupiedRoom_Returns400() throws Exception {
        AdminRoomRequest request = AdminRoomRequest.builder()
                .roomNumber("102")
                .floor(1)
                .categoryId(1L)
                .status(RoomStatus.AVAILABLE)
                .build();

        when(adminRoomService.updateRoom(eq(2L), any(AdminRoomRequest.class)))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Không thể thay đổi trạng thái của phòng đang có khách lưu trú (OCCUPIED)"));

        mockMvc.perform(put("/admin/rooms/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Không thể thay đổi trạng thái của phòng đang có khách lưu trú (OCCUPIED)"));
    }

    @Test
    @DisplayName("DELETE /admin/rooms/{id} - Phòng đang có khách hoặc có lịch đặt trước trả về HTTP 400")
    void testDeleteRoom_HasActiveBooking_Returns400() throws Exception {
        doThrow(new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa phòng đang có khách lưu trú hoặc có lịch đặt trước"))
                .when(adminRoomService).deleteRoom(2L);

        mockMvc.perform(delete("/admin/rooms/2"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Không thể xóa phòng đang có khách lưu trú hoặc có lịch đặt trước"));
    }

    @Test
    @DisplayName("DELETE /admin/rooms/{id} - Phòng đã có lịch sử đặt phòng/review trả về HTTP 400 yêu cầu chuyển MAINTENANCE")
    void testDeleteRoom_HasHistory_Returns400() throws Exception {
        doThrow(new AppException(ErrorCode.BAD_REQUEST, "Phòng đã phát sinh lịch sử đặt phòng nên không thể xóa. Vui lòng chuyển phòng sang trạng thái Bảo trì (MAINTENANCE)"))
                .when(adminRoomService).deleteRoom(1L);

        mockMvc.perform(delete("/admin/rooms/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Phòng đã phát sinh lịch sử đặt phòng nên không thể xóa. Vui lòng chuyển phòng sang trạng thái Bảo trì (MAINTENANCE)"));
    }

    @Test
    @DisplayName("DELETE /admin/rooms/{id} - Xóa cứng phòng thành công khi không vướng lịch sử (HTTP 200)")
    void testDeleteRoom_Success() throws Exception {
        doNothing().when(adminRoomService).deleteRoom(99L);

        mockMvc.perform(delete("/admin/rooms/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Xóa phòng thành công"));
    }
}
