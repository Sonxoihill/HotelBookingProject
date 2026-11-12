package com.hotel.booking.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hotel Booking Management System API")
                        .description("Tài liệu đặc tả API chuẩn quốc tế OpenAPI 3.0 cho Hệ thống Quản lý và Đặt phòng Khách sạn (Spring Boot 3 + Springdoc OpenAPI) bao phủ toàn bộ 17 Use Case thuộc 3 phân hệ:\n\n"
                                + "### 1. Phân hệ Khách hàng (Customer / Guest)\n"
                                + "- **Authentication (UC01, UC02)**: Đăng ký tài khoản mới, đăng nhập nhận JWT Token, kiểm tra phiên đăng nhập.\n"
                                + "- **User Profile (UC03)**: Xem hồ sơ cá nhân, cập nhật thông tin liên hệ và đổi mật khẩu.\n"
                                + "- **Room Search & Detail (UC04, UC05)**: Tìm kiếm & lọc phòng trống theo ngày nhận/trả, số lượng khách, mức giá; xem chi tiết phòng, tiện ích, đánh giá và báo giá linh hoạt.\n"
                                + "- **Booking & Concurrency (UC06, UC08)**: Tạo đơn đặt phòng với khóa bi quan (Pessimistic Locking) chống trùng phòng, xem lịch sử đặt phòng cá nhân, hủy đơn trước 24 giờ.\n"
                                + "- **Payment VNPay Sandbox (UC06)**: Tạo URL thanh toán VNPay HMAC-SHA512, xử lý Webhook IPN (whitelist IP) và Return URL.\n"
                                + "- **Review Management (UC07)**: Gửi đánh giá & nhận xét tiếng Việt UTF-8 sau khi hoàn tất trả phòng (`CHECKED_OUT`).\n\n"
                                + "### 2. Phân hệ Lễ tân (Receptionist)\n"
                                + "- **Room Matrix / Grid & Housekeeping (UC09, UC12)**: Xem sơ đồ ma trận buồng phòng thời gian thực theo tầng/trạng thái; xác nhận dọn phòng sạch (`DIRTY` -> `AVAILABLE`).\n"
                                + "- **Receptionist Booking Lifecycle (UC10)**: Tra cứu đơn đặt phòng, duyệt đơn (`CONFIRMED`), hủy đơn, làm thủ tục Check-in (`CHECKED_IN`/`OCCUPIED`), xem bảng kê quyết toán và xác nhận Check-out (`CHECKED_OUT`/`DIRTY`).\n"
                                + "- **Extra Services / Minibar (UC11)**: Ghi nhận dịch vụ phát sinh vào Folio phòng đang lưu trú và tự động cộng dồn hóa đơn.\n\n"
                                + "### 3. Phân hệ Quản trị viên (Admin)\n"
                                + "- **Admin Room Categories & Rooms (UC13a, UC13b)**: Quản lý CRUD danh mục hạng phòng và danh sách phòng vật lý.\n"
                                + "- **Admin Services (UC14)**: Quản lý CRUD danh mục dịch vụ phụ trợ (xóa mềm nếu đã phát sinh giao dịch).\n"
                                + "- **Admin Pricing Rules (UC15)**: Quản lý CRUD quy tắc giá linh hoạt (`HOLIDAY`, `PEAK_SEASON`, `WEEKEND`) có kiểm tra chống chồng chéo thời gian.\n"
                                + "- **Admin User & Staff Management (UC16)**: Tìm kiếm/lọc người dùng theo vai trò (`ADMIN`, `RECEPTIONIST`, `CUSTOMER`, `GUEST`), cấp tài khoản nhân sự mới gửi qua email, phân quyền vai trò, khóa/mở khóa tài khoản kèm Audit Log.\n"
                                + "- **Admin Revenue Reports (UC17)**: Thống kê KPI doanh thu, công suất lấp đầy phòng và xuất báo cáo định dạng Excel (`.xlsx`) / PDF (`.pdf`).")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Hotel Booking Engineering Team")
                                .email("support@hotelbooking.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api/v1").description("Local Development Server (http://localhost:8080/api/v1)"),
                        new Server().url("/api/v1").description("Relative Context Path Server (/api/v1)"),
                        new Server().url("https://hotelbookingproject-l6ru.onrender.com/api/v1").description("Cloud Render Server (https://hotelbookingproject-l6ru.onrender.com/api/v1)"),
                        new Server().url("https://hotelbookingproject-backend-cxau.onrender.com/api/v1").description("Production Render Server (main)")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Nhập mã JWT Token vào đây (không cần gõ tiền tố 'Bearer '). Ví dụ: eyJhbGciOiJIUzI1NiIsInR5cCI...")));
    }
}
