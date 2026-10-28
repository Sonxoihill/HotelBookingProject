-- V5__sprint7_admin_schema_and_seed.sql
-- Sprint 7: Schema updates (Pricing Rules, Room Category specs, User department, Audit logs) & Seed Data

-- ===================================================================
-- 1. CHUYỂN DYNAMIC_PRICING THÀNH PRICING_RULES
-- ===================================================================

-- a. Đổi tên bảng dynamic_pricing thành pricing_rules
RENAME TABLE dynamic_pricing TO pricing_rules;

-- b. Thêm các cột mới phục vụ quản trị giá linh hoạt
ALTER TABLE pricing_rules
    ADD COLUMN name VARCHAR(150),
    ADD COLUMN rule_type VARCHAR(20) NOT NULL DEFAULT 'HOLIDAY',
    ADD COLUMN adjustment_percent DECIMAL(6, 2),
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- c. Cho phép category_id mang giá trị NULL (NULL nghĩa là áp dụng toàn khách sạn), giữ nguyên khóa ngoại
ALTER TABLE pricing_rules MODIFY COLUMN category_id BIGINT NULL;

-- d. Chuyển đổi dữ liệu cũ: adjustment_percent = (multiplier - 1) * 100
UPDATE pricing_rules
SET adjustment_percent = (multiplier - 1) * 100,
    updated_at = CURRENT_TIMESTAMP;

-- Đặt tên và loại cho 2 bản ghi từ V2
UPDATE pricing_rules
SET name = 'Giáng sinh 2026', rule_type = 'HOLIDAY'
WHERE id = 1;

UPDATE pricing_rules
SET name = 'Tết Dương lịch 2027', rule_type = 'HOLIDAY'
WHERE id = 2;

-- e. Đặt adjustment_percent NOT NULL và loại bỏ cột multiplier cũ
ALTER TABLE pricing_rules MODIFY COLUMN adjustment_percent DECIMAL(6, 2) NOT NULL;
ALTER TABLE pricing_rules DROP COLUMN multiplier;

-- ===================================================================
-- 2. CẬP NHẬT BẢNG ROOM_CATEGORIES (SỐ GIƯỜNG & DIỆN TÍCH)
-- ===================================================================

ALTER TABLE room_categories
    ADD COLUMN bed_count INT NOT NULL DEFAULT 1,
    ADD COLUMN area DECIMAL(6, 2);

UPDATE room_categories SET bed_count = 1, area = 25.00 WHERE id = 1;
UPDATE room_categories SET bed_count = 1, area = 35.00 WHERE id = 2;
UPDATE room_categories SET bed_count = 2, area = 65.00 WHERE id = 3;

-- ===================================================================
-- 3. CẬP NHẬT BẢNG USERS (PHÒNG BAN - DEPARTMENT)
-- ===================================================================

ALTER TABLE users
    ADD COLUMN department VARCHAR(30) NULL;

UPDATE users SET department = 'MANAGEMENT' WHERE id = 1;
UPDATE users SET department = 'FRONT_DESK' WHERE id IN (2, 4, 5);

-- ===================================================================
-- 4. BẢNG MỚI AUDIT_LOGS (GHI NHẬN NHẬT KÝ THAY ĐỔI NHÂN SỰ)
-- ===================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT NOT NULL,
    target_user_id BIGINT NULL,
    action VARCHAR(50) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    description VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users (id),
    CONSTRAINT fk_audit_target FOREIGN KEY (target_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_target_user_id ON audit_logs(target_user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

-- ===================================================================
-- 5. SEED DATA SPRINT 7
-- ===================================================================

-- a. Seed thêm các quy tắc giá linh hoạt
INSERT INTO pricing_rules (id, name, rule_type, start_date, end_date, adjustment_percent, category_id, is_active, created_at, updated_at)
VALUES
(3, 'Quốc Khánh 2/9/2027 +20%', 'HOLIDAY', '2027-09-01', '2027-09-03', 20.00, 2, TRUE, '2026-04-15 08:00:00', '2026-04-15 08:00:00'),
(4, 'Phụ thu Cuối tuần +15%', 'WEEKEND', '2026-01-01', '2027-12-31', 15.00, NULL, TRUE, '2026-01-01 08:00:00', '2026-01-01 08:00:00')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    rule_type = VALUES(rule_type),
    start_date = VALUES(start_date),
    end_date = VALUES(end_date),
    adjustment_percent = VALUES(adjustment_percent),
    category_id = VALUES(category_id),
    is_active = VALUES(is_active),
    updated_at = VALUES(updated_at);

-- b. Nạp 10 đơn CHECKED_OUT (id 10 - 19) rải đều từ tháng 05 đến tháng 10/2026
INSERT INTO bookings (id, check_in, check_out, total_amount, status, user_id, room_id, cancel_reason, actual_check_in, actual_check_out, notes, paid_amount, created_at, updated_at)
VALUES
(10, '2026-05-10', '2026-05-13', 1920000.00, 'CHECKED_OUT', 3, 1, NULL, '2026-05-10 14:05:00', '2026-05-13 11:30:00', 'Khách trả phòng 101, thanh toán đầy đủ', 1920000.00, '2026-05-02 09:00:00', '2026-05-13 11:30:00'),
(11, '2026-05-20', '2026-05-24', 4150000.00, 'CHECKED_OUT', 3, 3, NULL, '2026-05-20 13:50:00', '2026-05-24 11:45:00', 'Khách trả phòng 201, thanh toán đầy đủ', 4150000.00, '2026-05-12 14:20:00', '2026-05-24 11:45:00'),
(12, '2026-06-05', '2026-06-08', 6580000.00, 'CHECKED_OUT', 3, 5, NULL, '2026-06-05 14:10:00', '2026-06-08 12:00:00', 'Khách trả phòng 301, thanh toán đầy đủ', 6580000.00, '2026-05-28 10:15:00', '2026-06-08 12:00:00'),
(13, '2026-06-18', '2026-06-20', 1100000.00, 'CHECKED_OUT', 3, 2, NULL, '2026-06-18 14:30:00', '2026-06-20 11:15:00', 'Khách trả phòng 102, thanh toán đầy đủ', 1100000.00, '2026-06-10 16:00:00', '2026-06-20 11:15:00'),
(14, '2026-07-08', '2026-07-12', 4460000.00, 'CHECKED_OUT', 3, 11, NULL, '2026-07-08 13:40:00', '2026-07-12 11:30:00', 'Khách trả phòng 203, thanh toán đầy đủ', 4460000.00, '2026-06-25 11:00:00', '2026-07-12 11:30:00'),
(15, '2026-07-22', '2026-07-26', 8080000.00, 'CHECKED_OUT', 3, 16, NULL, '2026-07-22 14:00:00', '2026-07-26 11:50:00', 'Khách trả phòng 302, thanh toán đầy đủ', 8080000.00, '2026-07-10 15:45:00', '2026-07-26 11:50:00'),
(16, '2026-08-10', '2026-08-14', 2260000.00, 'CHECKED_OUT', 3, 6, NULL, '2026-08-10 11:30:00', '2026-08-14 11:30:00', 'Khách trả phòng 103, thanh toán đầy đủ', 2260000.00, '2026-08-01 09:30:00', '2026-08-14 11:30:00'),
(17, '2026-08-25', '2026-08-28', 3140000.00, 'CHECKED_OUT', 3, 4, NULL, '2026-08-25 14:15:00', '2026-08-28 11:20:00', 'Khách trả phòng 202, thanh toán đầy đủ', 3140000.00, '2026-08-18 10:20:00', '2026-08-28 11:20:00'),
(18, '2026-09-12', '2026-09-16', 8400000.00, 'CHECKED_OUT', 3, 17, NULL, '2026-09-12 13:55:00', '2026-09-16 11:40:00', 'Khách trả phòng 303, thanh toán đầy đủ', 8400000.00, '2026-09-02 08:45:00', '2026-09-16 11:40:00'),
(19, '2026-10-02', '2026-10-06', 4580000.00, 'CHECKED_OUT', 3, 12, NULL, '2026-10-02 14:20:00', '2026-10-06 11:30:00', 'Khách trả phòng 204, thanh toán đầy đủ', 4580000.00, '2026-09-22 14:10:00', '2026-10-06 11:30:00')
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

-- c. Nạp các dịch vụ tương ứng cho các đơn đặt phòng trên (doanh thu dịch vụ)
INSERT INTO booking_services (id, quantity, price, booking_id, service_id, created_at)
VALUES
(1, 3, 120000.00, 10, 1, '2026-05-10 15:00:00'),
(2, 4, 15000.00, 10, 7, '2026-05-10 15:00:00'),
(3, 1, 250000.00, 11, 2, '2026-05-20 14:00:00'),
(4, 5, 20000.00, 11, 5, '2026-05-21 10:00:00'),
(5, 4, 120000.00, 12, 1, '2026-06-05 15:00:00'),
(6, 2, 350000.00, 12, 9, '2026-06-06 16:30:00'),
(7, 2, 50000.00, 13, 3, '2026-06-19 09:00:00'),
(8, 3, 150000.00, 14, 4, '2026-07-08 15:00:00'),
(9, 6, 35000.00, 14, 6, '2026-07-09 18:00:00'),
(10, 6, 120000.00, 15, 1, '2026-07-22 15:00:00'),
(11, 2, 80000.00, 15, 8, '2026-07-23 11:00:00'),
(12, 2, 100000.00, 16, 10, '2026-08-10 11:30:00'),
(13, 4, 15000.00, 16, 7, '2026-08-11 14:00:00'),
(14, 3, 50000.00, 17, 3, '2026-08-26 10:00:00'),
(15, 4, 35000.00, 17, 6, '2026-08-26 20:00:00'),
(16, 2, 250000.00, 18, 2, '2026-09-12 14:00:00'),
(17, 2, 350000.00, 18, 9, '2026-09-13 15:00:00'),
(18, 4, 120000.00, 19, 1, '2026-10-02 15:00:00'),
(19, 2, 150000.00, 19, 4, '2026-10-03 08:30:00')
ON DUPLICATE KEY UPDATE
    quantity = VALUES(quantity),
    price = VALUES(price),
    booking_id = VALUES(booking_id),
    service_id = VALUES(service_id);
