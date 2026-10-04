package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.dto.response.RoomDetailResponse;
import com.hotel.booking.dto.response.RoomSearchResponse;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.RoomService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RoomController.class)
@AutoConfigureMockMvc(addFilters = false)
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockBean
    private RoomService roomService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /rooms/search (UC04) - Tìm kiếm phòng thành công trả về HTTP 200")
    void testSearchRooms() throws Exception {
        RoomSearchResponse responseItem = RoomSearchResponse.builder()
                .id(1L)
                .roomNumber("101")
                .roomName("Phòng Deluxe Hướng Biển 101")
                .pricePerNight(new BigDecimal("1200000"))
                .capacity(2)
                .status("AVAILABLE")
                .build();

        when(roomService.searchRooms(any())).thenReturn(List.of(responseItem));

        mockMvc.perform(get("/rooms/search")
                        .param("checkIn", "2026-10-10")
                        .param("checkOut", "2026-10-12")
                        .param("capacity", "2")
                        .param("minPrice", "500000")
                        .param("maxPrice", "2000000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tìm kiếm phòng thành công"))
                .andExpect(jsonPath("$.data[0].id").value(1L))
                .andExpect(jsonPath("$.data[0].roomNumber").value("101"));
    }

    @Test
    @DisplayName("GET /rooms/{id} (UC05) - Lấy chi tiết phòng thành công trả về HTTP 200")
    void testGetRoomDetail() throws Exception {
        RoomDetailResponse detailResponse = RoomDetailResponse.builder()
                .id(1L)
                .roomNumber("101")
                .roomName("Deluxe Ocean View (Phòng 101)")
                .pricePerNight(new BigDecimal("1200000"))
                .capacity(2)
                .averageRating(4.8)
                .totalReviews(5)
                .build();

        when(roomService.getRoomDetail(1L)).thenReturn(detailResponse);

        mockMvc.perform(get("/rooms/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.roomNumber").value("101"))
                .andExpect(jsonPath("$.data.averageRating").value(4.8));
    }
}
