# Hướng dẫn tích hợp Swagger UI & Postman Workspace (SCRUM-78)

Tài liệu hướng dẫn sử dụng giao diện Swagger UI và nhập Postman Collection vào Postman Workspace cho dự án **Hotel Booking Management System**.

---

## 1. Giao diện Swagger UI (OpenAPI 3.0)

Swagger UI được tích hợp thông qua thư viện `springdoc-openapi-starter-webmvc-ui` (OpenAPI v3).

### Đường dẫn truy cập khi khởi chạy backend:
- **Swagger UI HTML**:
  - `http://localhost:8080/api/v1/swagger-ui.html`
  - Hoặc: `http://localhost:8080/api/v1/swagger-ui/index.html`
- **OpenAPI JSON Spec**:
  - `http://localhost:8080/api/v1/v3/api-docs`

### Tính năng trên Swagger UI:
- **Hiển thị đầy đủ các API**:
  - **Room Management**:
    - `GET /rooms/search` (Subtask 1.2 - UC04): Tìm kiếm & lọc phòng trống theo ngày nhận (`checkIn`), ngày trả (`checkOut`), khoảng giá (`minPrice`, `maxPrice`), hạng phòng (`categoryId`) và sức chứa (`capacity`).
    - `GET /rooms/{id}` (Subtask 1.3 - UC05): Xem chi tiết phòng, tiện ích, ảnh mô tả, giá và đánh giá của khách hàng.
    - `GET /rooms/public`: Danh sách phòng công khai hiển thị trang chủ.
    - `GET /rooms`: Toàn bộ danh sách phòng có phân trang.
  - **Authentication**: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
  - **Booking Management**: 
    - `POST /bookings` (SCRUM-93): Tạo đơn đặt phòng & khóa phòng ON_HOLD.
    - `GET /bookings/my-history`: Lịch sử đặt phòng.
    - `PATCH /bookings/{id}/cancel` (UC08): Khách hủy đơn đặt phòng trước giờ check-in (14:00) ít nhất 24 giờ.
  - **Receptionist (Sprint 6 - UC10 & UC11)**:
    - `GET /receptionist/rooms/grid` (UC10): Sơ đồ phòng trực quan (Room Grid) theo tầng & trạng thái.
    - `PATCH /receptionist/rooms/{id}/clean`: Xác nhận dọn phòng sạch sẽ (DIRTY -> AVAILABLE).
    - `GET /receptionist/bookings` (UC11): Danh sách quản lý đơn đặt phòng tại quầy lễ tân.
    - `PATCH /receptionist/bookings/{id}/approve` (UC11): Lễ tân duyệt đơn đặt phòng PENDING.
    - `PATCH /receptionist/bookings/{id}/cancel` (UC11): Lễ tân hủy đơn theo yêu cầu kèm lý do.
    - `PATCH /receptionist/bookings/{id}/check-in` (UC11): Khách làm thủ tục nhận phòng.
    - `GET /receptionist/bookings/{id}/checkout-summary` (UC11): Bảng kê chi phí quyết toán trước khi trả phòng.
    - `POST /receptionist/bookings/{id}/check-out` (UC11): Khách làm thủ tục trả phòng và thu ngân.
    - `POST /receptionist/bookings/{bookingId}/services`: Ghi nhận dịch vụ phát sinh vào đơn lưu trú.
    - `GET /receptionist/bookings/{bookingId}/services`: Lấy danh sách dịch vụ của đơn đặt phòng.
  - **Hotel Services**: `GET /services`.
  - **Reviews**: 
    - `GET /reviews/room/{roomId}`: Điểm đánh giá trung bình & danh sách đánh giá của phòng (chống XSS).
    - `POST /reviews` (UC07): Đánh giá phòng gắn với đơn đặt phòng sau khi đã hoàn tất trả phòng (`CHECKED_OUT`), mỗi đơn 1 lần, số sao từ 1 đến 5.
    - `GET /reviews/my-reviews`: Lịch sử các đánh giá của bản thân.
  - **Payment & VNPay (SCRUM-94)**: `POST /payment/create-payment`, `GET /payment/vnpay-ipn`, `GET /payment/vnpay-return`.
  - **User Management**: `GET /users/profile`, `PUT /users/profile`, `PUT /users/change-password`.
  - **Admin & Receptionist Ping**: `GET /admin/ping`, `GET /receptionist/ping`.
  - **Health**: `GET /health`, `GET /health/test-error`, `POST /health/test-validation`.
- **Hỗ trợ Authorize bằng JWT Bearer Token**:
  - Bấm nút **Authorize 🔓** góc trên bên phải Swagger UI.
  - Nhập chuỗi JWT token (không cần gõ chữ `Bearer`). Swagger UI sẽ tự động gắn header `Authorization: Bearer <token>` vào tất cả các request có yêu cầu quyền hạn.

---

## 2. Hướng dẫn cập nhật Postman Workspace

Dự án đã đóng gói sẵn bộ Postman Collection và Environment tại thư mục `/postman`:
1. `postman/Hotel_Booking_API.postman_collection.json` (Chuẩn Postman Collection v2.1.0)
2. `postman/Hotel_Booking_Environment.postman_environment.json` (Biến môi trường mẫu)

### Các bước Import vào Postman Workspace:
1. Mở ứng dụng **Postman** (hoặc Postman Web).
2. Vào Workspace của bạn.
3. Chọn nút **Import** (góc trên bên trái).
4. Kéo thả 2 file sau vào giao diện Import:
   - `Hotel_Booking_API.postman_collection.json`
   - `Hotel_Booking_Environment.postman_environment.json`
5. Nhấn **Import**.

### Cách sử dụng trong Postman:
- Chọn Environment: **Hotel Booking - Local Environment**.
- Biến `baseUrl`: mặc định là `http://localhost:8080/api/v1`.
- Chạy request `01. Authentication -> Đăng nhập (Login)`:
  - Hệ thống có gắn sẵn Script Test tự động lưu JWT token vào biến môi trường `token`.
  - Tất cả các request tiếp theo trong collection sẽ tự động sử dụng biến `{{token}}` cho header `Authorization`.
- Thử nghiệm các API trong thư mục `02. Room Management`:
  - `Tìm kiếm & Lọc phòng trống (UC04)`: Đã có sẵn query params mẫu (`checkIn`, `checkOut`, `capacity`, `minPrice`, `maxPrice`, `categoryId`).
  - `Xem chi tiết phòng (UC05)`: Đã có sẵn mẫu request `GET /rooms/1`.

---

## 3. Cập nhật trực tiếp từ OpenAPI URL vào Postman (Nếu cần)
Bạn cũng có thể import trực tiếp từ OpenAPI endpoint của server đang chạy:
1. Mở Postman -> Chọn **Import**.
2. Nhập URL: `http://localhost:8080/api/v1/v3/api-docs`.
3. Postman sẽ tự động đồng bộ tất cả endpoint và tạo Collection mới.
