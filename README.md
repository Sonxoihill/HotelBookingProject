# 🏨 Dự Án Quản Lý Đặt Phòng Khách Sạn (Hotel Booking Project)

Hệ thống quản lý đặt phòng khách sạn trực tuyến Full-stack xây dựng trên nền tảng **Spring Boot 3 (Java 21)**, **React 19 (Vite + TailwindCSS)** và cơ sở dữ liệu **MySQL 8.0**.

Tài liệu này hướng dẫn thực thi khởi động toàn bộ hệ thống bằng **1 lệnh duy nhất** theo yêu cầu tại **Mục 4.3.5 (Báo cáo Quản lý dự án)** và **Mục 9.5 (Kế hoạch kiểm tra)**.

---

## 🚀 Khởi Động Toàn Bộ Hệ Thống Bằng 1 Lệnh Duy Nhất

### Yêu cầu tiên quyết
- Đã cài đặt **Docker Desktop** (khuyến nghị phiên bản 20+ hoặc 24+).
- Hãy đảm bảo ứng dụng **Docker Desktop đã được bật** trước khi chạy lệnh.

### Lệnh chạy (One-Command Startup)

Mở Terminal (PowerShell / Command Prompt / Git Bash / macOS / Linux) tại thư mục gốc dự án và chạy:

```bash
docker compose up --build -d
```

*(Nếu muốn xem log trực tiếp trong terminal, chạy `docker compose up --build` không có cờ `-d`)*

### Lệnh tắt toàn bộ hệ thống
```bash
docker compose down
```
*(Nếu muốn xóa cả dữ liệu DB để chạy lại từ đầu: `docker compose down -v`)*

---

## 🌐 Danh Mục Dịch Vụ & Cổng Truy Cập (Port Mapping)

Khi hệ thống khởi động thành công, 3 container sẽ hoạt động đồng bộ trên mạng nội bộ `hotel-network`:

| Tên Dịch Vụ | Tên Container | Cổng Host (Máy Thật) | Cổng Nội Bộ (Container) | Đường Dẫn Truy Cập | Chức Năng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | `hotel-frontend` | `5173` & `80` | `80` (Nginx) | [http://localhost:5173](http://localhost:5173) hoặc [http://localhost](http://localhost) | Giao diện Khách hàng, Lễ tân & Admin |
| **Backend API** | `hotel-backend` | `8080` | `8080` | [http://localhost:8080/api/v1](http://localhost:8080/api/v1) | RESTful API & Business Logic |
| **Swagger UI** | `hotel-backend` | `8080` | `8080` | [http://localhost:8080/api/v1/swagger-ui.html](http://localhost:8080/api/v1/swagger-ui.html) | Tài liệu kiểm thử API trực quan |
| **Database** | `mysql-db` | `3308` | `3306` | `localhost:3308` | Cơ sở dữ liệu MySQL 8.0 & Flyway Migration |

---

## ⚙️ Các Biến Môi Trường Tích Hợp Sẵn Trong Container

Hệ thống đã được thiết lập sẵn các giá trị mặc định tối ưu để chạy ngay lập tức mà không cần cấu hình thêm:

1. **Cơ sở dữ liệu (MySQL)**:
   - Host nội bộ: `mysql-db:3306`
   - Database: `hotel_booking`
   - Username: `root` | Password: `123456`
   - Quản trị DB từ máy host: Cổng `3308`
   - Tự động chạy Flyway Migration (V1 đến V4).

2. **Cổng thanh toán điện tử VNPay (Sandbox)**:
   - `TMN Code`: `CGXZLS0Z`
   - `Hash Secret`: `XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN`
   - `Return URL`: `http://localhost:5173/api/v1/payment/vnpay-return`
   - Whitelist IPs: IP Sandbox VNPay và Localhost.

3. **Dịch vụ Email (Gmail SMTP)**:
   - `MAIL_USERNAME`: `vtruong1628@gmail.com`
   - `MAIL_PASSWORD`: `sceizoqtzavsfcyk`
   - Gửi email xác nhận đặt phòng và mã OTP.

4. **Bảo mật & Phân quyền (JWT)**:
   - Secret key chuẩn HMAC SHA-256.
   - Thời gian sống Token: 24 giờ (`86400000 ms`).

5. **Cross-Origin Resource Sharing (CORS)**:
   - Cho phép các nguồn: `http://localhost:5173`, `http://localhost:3000`, `http://localhost:80`, `http://localhost`.

---

## 🔍 Kiểm Tra Trạng Thái Hoạt Động (Healthcheck)

Sau khi chạy lệnh khởi động, bạn có thể kiểm tra trạng thái 3 container bằng lệnh:

```bash
docker compose ps
```

Kết quả mong đợi:
```text
NAME             IMAGE                   COMMAND                  SERVICE          CREATED         STATUS                   PORTS
hotel-frontend   hotel-frontend:latest   "/docker-entrypoint.…"   hotel-frontend   Up              0.0.0.0:80->80/tcp, 0.0.0.0:5173->80/tcp
hotel-backend    hotel-backend:latest    "sh -c 'java -XX:+Us…"   hotel-backend    Up              0.0.0.0:8080->8080/tcp
mysql-db         mysql:8.0               "docker-entrypoint.s…"   mysql-db         Up (healthy)    0.0.0.0:3308->3306/tcp
```
