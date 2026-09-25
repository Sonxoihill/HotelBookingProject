-- V2__seed_initial_data.sql
-- Seed Initial Data for 9 Core Tables

-- 1. Seed Users (ADMIN, RECEPTIONIST, GUEST)
INSERT INTO users (id, email, password, full_name, phone, role, status) VALUES
(1, 'admin@gmail.com', '$2a$10$OxPPTB8GlxjW2rZNo5ngl.W8tJsEgNADGJgrN1PIrgZzY6fEdJJaC', 'Quản Trị Viên', '0901234567', 'ADMIN', 'ACTIVE'),
(2, 'receptionist@gmail.com', '$2a$10$OxPPTB8GlxjW2rZNo5ngl.W8tJsEgNADGJgrN1PIrgZzY6fEdJJaC', 'Lễ Tân Khách Sạn', '0902345678', 'RECEPTIONIST', 'ACTIVE'),
(3, 'guest@gmail.com', '$2a$10$OxPPTB8GlxjW2rZNo5ngl.W8tJsEgNADGJgrN1PIrgZzY6fEdJJaC', 'Nguyễn Văn Khách', '0903456789', 'GUEST', 'ACTIVE')
ON DUPLICATE KEY UPDATE email=VALUES(email), password=VALUES(password);

-- 2. Seed Room Categories
INSERT INTO room_categories (id, name, description, base_price, capacity, bed_type, image_url) VALUES
(1, 'Standard Single', 'Phòng tiêu chuẩn ấm cúng dành cho 1 người với đầy đủ tiện nghi cơ bản.', 500000.00, 1, '1 Giường đơn', 'https://images.unsplash.com/photo-1590490360182-c33d57733427'),
(2, 'Deluxe Double', 'Phòng Deluxe sang trọng với giường đôi và view thoáng đãng.', 950000.00, 2, '1 Giường đôi King size', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'),
(3, 'Family Suite', 'Phòng gia đình rộng rãi có phòng khách riêng và 2 giường lớn.', 1800000.00, 4, '2 Giường Queen size', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Seed Rooms
INSERT INTO rooms (id, room_number, floor, status, category_id) VALUES
(1, '101', 1, 'AVAILABLE', 1),
(2, '102', 1, 'AVAILABLE', 1),
(3, '201', 2, 'AVAILABLE', 2),
(4, '202', 2, 'AVAILABLE', 2),
(5, '301', 3, 'AVAILABLE', 3)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 4. Seed Services
INSERT INTO services (id, name, price, description, status) VALUES
(1, 'Bữa sáng Buffet', 120000.00, 'Bữa sáng tự chọn phong phú món Á - Âu', 'ACTIVE'),
(2, 'Đưa đón sân bay', 250000.00, 'Xe 4 chỗ đưa đón tận nơi từ sân bay', 'ACTIVE'),
(3, 'Dịch vụ Giặt là', 50000.00, 'Giặt sấy lấy ngay trong vòng 4 tiếng', 'ACTIVE'),
(4, 'Thuê xe máy', 150000.00, 'Thuê xe tay ga hoặc xe số theo ngày', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Seed Dynamic Pricing (Cao điểm cuối tuần / ngày lễ)
INSERT INTO dynamic_pricing (id, start_date, end_date, multiplier, category_id) VALUES
(1, '2026-12-24', '2026-12-25', 1.30, 2),
(2, '2026-12-31', '2027-01-01', 1.50, 3)
ON DUPLICATE KEY UPDATE multiplier=VALUES(multiplier);
