-- V4__sprint6_schema_and_seed.sql
-- Sprint 6: Schema updates (Check-in/out, Cancellation, Services, Review constraints) & Seed Data

-- ===================================================================
-- 1. ALTER TABLE SCHEMAS
-- ===================================================================

-- i. Bảng bookings: Bổ sung các cột phục vụ Check-in/out, Hủy đơn, Ghi chú và Tiền trả trước
ALTER TABLE bookings 
    ADD COLUMN cancel_reason TEXT, 
    ADD COLUMN actual_check_in DATETIME, 
    ADD COLUMN actual_check_out DATETIME, 
    ADD COLUMN notes TEXT, 
    ADD COLUMN paid_amount DECIMAL(12,2) DEFAULT 0;

-- ii. Bảng services: Bổ sung cột unit để lưu đơn vị tính (Lon, Bộ, Lần, Kg...)
ALTER TABLE services 
    ADD COLUMN unit VARCHAR(50) DEFAULT 'Lần';

-- iii. Bảng reviews: Bổ sung booking_id UNIQUE kèm khóa ngoại để ràng buộc 1 booking chỉ đánh giá 1 lần
ALTER TABLE reviews 
    ADD COLUMN booking_id BIGINT UNIQUE, 
    ADD CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings(id);

-- ===================================================================
-- 2. SEED DATA SPRINT 6
-- ===================================================================

-- a. Thêm 2 tài khoản ROLE_RECEPTIONIST (mật khẩu mã hóa BCrypt cho pass: 123456)
INSERT INTO users (id, email, password, full_name, phone, role, status) VALUES
(4, 'receptionist1@gmail.com', '$2a$10$OxPPTB8GlxjW2rZNo5ngl.W8tJsEgNADGJgrN1PIrgZzY6fEdJJaC', 'Lễ Tân Ca Sáng', '0902345679', 'RECEPTIONIST', 'ACTIVE'),
(5, 'receptionist2@gmail.com', '$2a$10$OxPPTB8GlxjW2rZNo5ngl.W8tJsEgNADGJgrN1PIrgZzY6fEdJJaC', 'Lễ Tân Ca Tối', '0902345680', 'RECEPTIONIST', 'ACTIVE')
ON DUPLICATE KEY UPDATE 
    email = VALUES(email), 
    password = VALUES(password), 
    full_name = VALUES(full_name), 
    phone = VALUES(phone), 
    role = VALUES(role), 
    status = VALUES(status);

-- b. Cập nhật và đảm bảo đủ 20 phòng vật lý chia theo 3 tầng với đủ các trạng thái RoomStatus
-- Trạng thái: AVAILABLE, OCCUPIED, DIRTY, RESERVED, MAINTENANCE
INSERT INTO rooms (id, room_number, floor, status, category_id) VALUES
-- Tầng 1: 7 phòng (Category 1 - Standard Single)
(1, '101', 1, 'AVAILABLE', 1),
(2, '102', 1, 'OCCUPIED', 1),
(6, '103', 1, 'AVAILABLE', 1),
(7, '104', 1, 'DIRTY', 1),
(8, '105', 1, 'RESERVED', 1),
(9, '106', 1, 'OCCUPIED', 1),
(10, '107', 1, 'MAINTENANCE', 1),

-- Tầng 2: 7 phòng (Category 2 - Deluxe Double)
(3, '201', 2, 'AVAILABLE', 2),
(4, '202', 2, 'DIRTY', 2),
(11, '203', 2, 'AVAILABLE', 2),
(12, '204', 2, 'OCCUPIED', 2),
(13, '205', 2, 'DIRTY', 2),
(14, '206', 2, 'RESERVED', 2),
(15, '207', 2, 'MAINTENANCE', 2),

-- Tầng 3: 6 phòng (Category 3 - Family Suite)
(5, '301', 3, 'RESERVED', 3),
(16, '302', 3, 'AVAILABLE', 3),
(17, '303', 3, 'OCCUPIED', 3),
(18, '304', 3, 'DIRTY', 3),
(19, '305', 3, 'RESERVED', 3),
(20, '306', 3, 'MAINTENANCE', 3)
ON DUPLICATE KEY UPDATE 
    room_number = VALUES(room_number),
    floor = VALUES(floor),
    status = VALUES(status),
    category_id = VALUES(category_id);

-- c. Nạp đủ 10 dịch vụ phát sinh vào bảng services kèm đơn giá và đơn vị tính (unit)
INSERT INTO services (id, name, price, description, status, unit) VALUES
(1, 'Bữa sáng Buffet', 120000.00, 'Bữa sáng tự chọn phong phú món Á - Âu', 'ACTIVE', 'Suất'),
(2, 'Đưa đón sân bay', 250000.00, 'Xe 4 chỗ đưa đón tận nơi từ sân bay', 'ACTIVE', 'Chuyến'),
(3, 'Dịch vụ Giặt là', 50000.00, 'Giặt sấy lấy ngay trong vòng 4 tiếng', 'ACTIVE', 'Kg'),
(4, 'Thuê xe máy', 150000.00, 'Thuê xe tay ga hoặc xe số theo ngày', 'ACTIVE', 'Ngày'),
(5, 'Nước ngọt Cocacola', 20000.00, 'Nước ngọt giải khát Cocacola 330ml ướp lạnh minibar', 'ACTIVE', 'Lon'),
(6, 'Bia Heineken', 35000.00, 'Bia lon Heineken bạc 330ml minibar', 'ACTIVE', 'Lon'),
(7, 'Nước suối Aquafina', 15000.00, 'Nước khoáng tinh khiết Aquafina 500ml', 'ACTIVE', 'Chai'),
(8, 'Set đồ ăn nhẹ Minibar', 80000.00, 'Gồm snack khoai tây, hạt điều rang muối và kẹo socola', 'ACTIVE', 'Bộ'),
(9, 'Dịch vụ Spa & Massage', 350000.00, 'Massage toàn thân thư giãn bằng tinh dầu thảo dược 60 phút', 'ACTIVE', 'Lần'),
(10, 'Phụ thu Nhận phòng sớm', 100000.00, 'Phụ thu check-in sớm trước 14:00 theo nhu cầu của khách', 'ACTIVE', 'Giờ')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    price = VALUES(price),
    description = VALUES(description),
    status = VALUES(status),
    unit = VALUES(unit);

-- d. Nạp các đơn bookings mẫu ở đủ các trạng thái PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT (có paid_amount)
INSERT INTO bookings (id, check_in, check_out, total_amount, status, user_id, room_id, cancel_reason, actual_check_in, actual_check_out, notes, paid_amount, created_at, updated_at) VALUES
(1, '2026-10-10', '2026-10-15', 2750000.00, 'CONFIRMED', 3, 1, NULL, NULL, NULL, 'Khách đặt qua website, đã cọc đủ 100% qua VNPay', 2750000.00, '2026-09-28 10:00:00', '2026-09-28 10:00:00'),
(2, '2026-10-10', '2026-10-13', 1650000.00, 'CHECKED_IN', 3, 2, NULL, '2026-10-10 14:15:00', NULL, 'Khách đã làm thủ tục nhận phòng 102, đã trả đủ tiền', 1650000.00, '2026-09-28 11:30:00', '2026-10-10 14:15:00'),
(3, '2026-10-12', '2026-10-18', 6270000.00, 'CHECKED_OUT', 3, 3, NULL, '2026-10-12 13:50:00', '2026-10-18 11:30:00', 'Khách đã trả phòng 201, thanh toán đầy đủ hóa đơn', 6270000.00, '2026-09-29 08:15:00', '2026-10-18 11:30:00'),
(4, '2026-10-20', '2026-10-25', 9900000.00, 'PENDING', 3, 5, NULL, NULL, NULL, 'Đơn mới tạo, đang chờ khách hoàn tất thanh toán tiền phòng', 0.00, '2026-09-29 09:45:00', '2026-09-29 09:45:00'),
(5, '2026-10-22', '2026-10-25', 1500000.00, 'PENDING', 3, 6, NULL, NULL, NULL, 'Khách đặt trước phòng Standard Single 103, chưa cọc', 0.00, '2026-10-15 08:30:00', '2026-10-15 08:30:00'),
(6, '2026-10-18', '2026-10-21', 2850000.00, 'CONFIRMED', 3, 11, NULL, NULL, NULL, 'Khách đã cọc 1.000.000đ tại quầy lễ tân cho phòng 203', 1000000.00, '2026-10-15 09:15:00', '2026-10-15 09:15:00'),
(7, '2026-10-14', '2026-10-17', 2850000.00, 'CHECKED_IN', 3, 12, NULL, '2026-10-14 14:00:00', NULL, 'Khách đang lưu trú tại phòng 204, yêu cầu dọn phòng hằng ngày', 2850000.00, '2026-10-12 10:00:00', '2026-10-14 14:00:00'),
(8, '2026-10-01', '2026-10-05', 2000000.00, 'CHECKED_OUT', 3, 1, NULL, '2026-10-01 13:30:00', '2026-10-05 11:45:00', 'Đã check-out phòng 101, dịch vụ giặt là đã thanh toán', 2000000.00, '2026-09-25 15:00:00', '2026-10-05 11:45:00'),
(9, '2026-10-08', '2026-10-10', 1000000.00, 'CANCELLED', 3, 7, 'Khách thay đổi lịch trình cá nhân đột xuất', NULL, NULL, 'Đơn hủy hợp lệ trước 48 giờ, đã hoàn tiền cọc', 500000.00, '2026-10-02 11:00:00', '2026-10-07 16:30:00')
ON DUPLICATE KEY UPDATE 
    check_in = VALUES(check_in),
    check_out = VALUES(check_out),
    total_amount = VALUES(total_amount),
    status = VALUES(status),
    cancel_reason = VALUES(cancel_reason),
    actual_check_in = VALUES(actual_check_in),
    actual_check_out = VALUES(actual_check_out),
    notes = VALUES(notes),
    paid_amount = VALUES(paid_amount),
    updated_at = VALUES(updated_at);

-- e. Cập nhật booking_id cho các review đã có từ V3
UPDATE reviews SET booking_id = 1 WHERE id = 1 AND booking_id IS NULL;
UPDATE reviews SET booking_id = 3 WHERE id = 3 AND booking_id IS NULL;
