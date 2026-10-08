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
                        .description("Tài liệu API hệ thống Quản lý và Đặt phòng Khách sạn (Spring Boot 3 + Springdoc OpenAPI).\n\n"
                                + "Bao gồm đầy đủ các module:\n"
                                + "- **Room Management**: Tìm kiếm & lọc phòng (UC04), xem chi tiết phòng (UC05), danh sách phòng\n"
                                + "- **Authentication**: Đăng ký, đăng nhập, lấy thông tin cá nhân\n"
                                + "- **Bookings**: Đặt phòng (giữ chỗ ON_HOLD, pessimistic locking), hủy phòng, xem lịch sử đặt phòng\n"
                                + "- **Payment & VNPay Sandbox**: Tích hợp cổng thanh toán VNPay Sandbox (SCRUM-94), tạo URL thanh toán, xử lý Webhook IPN và Return URL\n"
                                + "- **Confirmation Email**: Tự động gửi email xác nhận đặt phòng kèm chi tiết hóa đơn qua Google SMTP bất đồng bộ (SCRUM-95)\n"
                                + "- **Reviews**: Đánh giá phòng, xem đánh giá của phòng và của cá nhân\n"
                                + "- **Services**: Danh sách dịch vụ khách sạn\n"
                                + "- **Users**: Quản lý hồ sơ, đổi mật khẩu\n"
                                + "- **Admin & Receptionist**: Xác thực và quản trị hệ thống quầy lễ tân\n"
                                + "- **Health**: Kiểm tra trạng thái hoạt động hệ thống")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Hotel Booking Engineering Team")
                                .email("support@hotelbooking.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("/api/v1").description("Local Context Path Server (/api/v1)"),
                        new Server().url("/").description("Direct Root Server (/)"),
                        new Server().url("https://hotelbookingproject-5wqz.onrender.com/api/v1").description("Production Server (Render)")
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
