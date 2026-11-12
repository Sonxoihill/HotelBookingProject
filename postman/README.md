# Hướng dẫn tích hợp Swagger OpenAPI 3.0 & Postman Collection Final (SCRUM-171)

Tài liệu hướng dẫn sử dụng giao diện Swagger UI, file đặc tả tĩnh OpenAPI 3.0 và bộ sưu tập kiểm thử Postman Collection v2.1 cho toàn bộ **17 Use Case** của dự án **Hotel Booking Management System**.

---

## 1. Tài liệu đặc tả OpenAPI 3.0 (`docs/api/`)

### File đặc tả tĩnh trong Git:
- [docs/api/openapi.json](../docs/api/openapi.json) — Đặc tả OpenAPI 3.0 định dạng JSON (`GET /api/v1/v3/api-docs`).
- [docs/api/openapi.yaml](../docs/api/openapi.yaml) — Đặc tả OpenAPI 3.0 định dạng YAML (`GET /api/v1/v3/api-docs.yaml`).

### Đường dẫn truy cập trực tiếp khi chạy Backend:
- **Swagger UI HTML**: `http://localhost:8080/api/v1/swagger-ui.html` (hoặc `http://localhost:8080/api/v1/swagger-ui/index.html`)
- **OpenAPI JSON Spec**: `http://localhost:8080/api/v1/v3/api-docs`
- **OpenAPI YAML Spec**: `http://localhost:8080/api/v1/v3/api-docs.yaml`

---

## 2. Bộ sưu tập Postman Collection v2.1 & Environments (`postman/`)

Dự án đóng gói bộ Postman Collection và 2 file Environment chuẩn tại thư mục `postman/`:
1. `postman/Hotel_Booking_API_v1.0.0.json` — Bộ sưu tập Postman Collection v2.1.0 gồm 3 phân hệ:
   - **Thư mục 1: Khách Hàng (Customer)** (`POST /auth/register`, `POST /auth/login`, `GET /rooms/search`, `GET /rooms/{id}`, `POST /bookings`, `POST /payment/create-vnpay-url`, `GET /bookings/my-bookings`, `PATCH /bookings/{id}/cancel`, `POST /reviews`)
   - **Thư mục 2: Lễ Tân (Receptionist)** (`POST /auth/login-receptionist`, `GET /receptionist/rooms/matrix`, `PATCH /receptionist/bookings/{id}/check-in`, `POST /receptionist/bookings/{id}/services`, `GET /receptionist/bookings/{id}/checkout-summary`, `POST /receptionist/bookings/{id}/check-out`, `PATCH /receptionist/rooms/{id}/clean`)
   - **Thư mục 3: Quản Trị Viên (Admin)** (`POST /auth/login-admin`, CRUD `/admin/room-categories`, CRUD `/admin/rooms`, CRUD `/admin/services`, CRUD `/admin/pricing-rules`, `GET /admin/users`, `POST /admin/users/staff`, `PATCH /admin/users/{id}/role`, `PATCH /admin/users/{id}/lock`, `GET /admin/reports/revenue`, `GET /admin/reports/export/excel`, `GET /admin/reports/export/pdf`)
2. `postman/Hotel_Booking_Local.postman_environment.json` — Môi trường Local (`baseUrl = http://localhost:8080/api/v1`).
3. `postman/Hotel_Booking_Cloud.postman_environment.json` — Môi trường Cloud Render (`baseUrl = https://hotelbookingproject-l6ru.onrender.com/api/v1`).

> **Lưu ý bảo mật**: Các file JSON tuyệt đối không lưu mật khẩu thật, JWT token thật hoặc secret. Trước khi chạy request Login trong Postman, hãy điền mật khẩu kiểm thử vào trường `password` hoặc biến môi trường.

### Tự động đồng bộ JWT Token (`{{jwt_token}}`):
- Cấp độ Collection đã cấu hình sẵn **Authorization: Bearer Token** với giá trị `{{jwt_token}}`.
- Khi chạy bất kỳ request Đăng nhập nào (`POST /auth/login`, `POST /auth/login-receptionist`, `POST /auth/login-admin`), Test Script sau sẽ tự động trích xuất và lưu JWT vào biến môi trường `jwt_token`:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    var token = jsonData.data ? jsonData.data.token : jsonData.token;
    pm.environment.set("jwt_token", token);
    console.log("JWT Token synced: " + token);
}
```
