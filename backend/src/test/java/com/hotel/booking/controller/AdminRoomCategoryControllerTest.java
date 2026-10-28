package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.RoomCategoryRequest;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.AdminRoomCategoryService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminRoomCategoryController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminRoomCategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockBean
    private AdminRoomCategoryService adminRoomCategoryService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /admin/room-categories - Lấy danh sách loại phòng thành công (HTTP 200)")
    void testGetAllCategories_Success() throws Exception {
        RoomCategory cat = RoomCategory.builder()
                .name("Standard Single")
                .basePrice(new BigDecimal("500000.00"))
                .capacity(1)
                .bedCount(1)
                .area(new BigDecimal("25.00"))
                .build();
        cat.setId(1L);

        when(adminRoomCategoryService.getAllCategories()).thenReturn(List.of(cat));

        mockMvc.perform(get("/admin/room-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Standard Single"));
    }

    @Test
    @DisplayName("POST /admin/room-categories - Tạo loại phòng thành công (HTTP 201)")
    void testCreateCategory_Success() throws Exception {
        RoomCategoryRequest request = RoomCategoryRequest.builder()
                .name("VIP Executive Suite")
                .basePrice(new BigDecimal("3500000.00"))
                .capacity(4)
                .bedCount(2)
                .area(new BigDecimal("80.00"))
                .bedType("2 King beds")
                .description("Phòng tổng thống sang trọng")
                .imageUrl("https://example.com/suite.jpg")
                .build();

        RoomCategory created = RoomCategory.builder()
                .name(request.getName())
                .basePrice(request.getBasePrice())
                .capacity(request.getCapacity())
                .bedCount(request.getBedCount())
                .area(request.getArea())
                .build();
        created.setId(10L);

        when(adminRoomCategoryService.createCategory(any(RoomCategoryRequest.class))).thenReturn(created);

        mockMvc.perform(post("/admin/room-categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10L))
                .andExpect(jsonPath("$.data.name").value("VIP Executive Suite"));
    }

    @Test
    @DisplayName("POST /admin/room-categories - Dữ liệu không hợp lệ trả về HTTP 400")
    void testCreateCategory_ValidationError() throws Exception {
        RoomCategoryRequest invalidRequest = RoomCategoryRequest.builder()
                .name("")
                .basePrice(new BigDecimal("-100"))
                .capacity(0)
                .bedCount(0)
                .area(new BigDecimal("0"))
                .build();

        mockMvc.perform(post("/admin/room-categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /admin/room-categories - Trùng tên loại phòng trả về HTTP 409")
    void testCreateCategory_DuplicateName() throws Exception {
        RoomCategoryRequest request = RoomCategoryRequest.builder()
                .name("Deluxe Double")
                .basePrice(new BigDecimal("950000.00"))
                .capacity(2)
                .bedCount(1)
                .area(new BigDecimal("35.00"))
                .build();

        when(adminRoomCategoryService.createCategory(any(RoomCategoryRequest.class)))
                .thenThrow(new AppException(ErrorCode.CONFLICT, "Tên loại phòng đã tồn tại"));

        mockMvc.perform(post("/admin/room-categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Tên loại phòng đã tồn tại"));
    }

    @Test
    @DisplayName("DELETE /admin/room-categories/{id} - Đang có phòng vật lý sử dụng trả về HTTP 400")
    void testDeleteCategory_HasRooms_Returns400() throws Exception {
        doThrow(new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa loại phòng đang được sử dụng bởi các phòng vật lý"))
                .when(adminRoomCategoryService).deleteCategory(1L);

        mockMvc.perform(delete("/admin/room-categories/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Không thể xóa loại phòng đang được sử dụng bởi các phòng vật lý"));
    }

    @Test
    @DisplayName("DELETE /admin/room-categories/{id} - Xóa thành công khi không vướng ràng buộc (HTTP 200)")
    void testDeleteCategory_Success() throws Exception {
        doNothing().when(adminRoomCategoryService).deleteCategory(99L);

        mockMvc.perform(delete("/admin/room-categories/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Xóa loại phòng thành công"));
    }
}
