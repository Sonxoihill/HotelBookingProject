-- V3__seed_sprint4_test_data.sql

INSERT INTO bookings (id, check_in, check_out, total_amount, status, user_id, room_id, created_at, updated_at) VALUES
(1, '2026-10-10', '2026-10-15', 2750000.00, 'CONFIRMED', 3, 1, '2026-09-28 10:00:00', '2026-09-28 10:00:00'),
(2, '2026-10-10', '2026-10-13', 1650000.00, 'CONFIRMED', 3, 2, '2026-09-28 11:30:00', '2026-09-28 11:30:00'),
(3, '2026-10-12', '2026-10-18', 6270000.00, 'CONFIRMED', 3, 3, '2026-09-29 08:15:00', '2026-09-29 08:15:00'),
(4, '2026-10-20', '2026-10-25', 9900000.00, 'CONFIRMED', 3, 5, '2026-09-29 09:45:00', '2026-09-29 09:45:00')
ON DUPLICATE KEY UPDATE 
    check_in = VALUES(check_in),
    check_out = VALUES(check_out),
    total_amount = VALUES(total_amount),
    status = VALUES(status);


INSERT INTO reviews (id, rating, comment, user_id, room_id, created_at) VALUES
(1, 5, 'Phòng sạch sẽ, không gian thoáng đãng và nhân viên phục vụ rất chu đáo. Trải nghiệm nghỉ dưỡng tuyệt vời!', 3, 1, '2026-09-25 10:30:00'),
(2, 4, 'Tiện nghi phòng Standard Single rất ổn, giường êm. Bữa sáng phong phú, chỉ có wifi đôi lúc hơi chập chờn vào giờ cao điểm.', 3, 1, '2026-09-27 14:15:00'),
(3, 5, 'Phòng Deluxe rộng rãi, view ngắm thành phố rất đẹp cả ngày lẫn đêm. Nội thất sang trọng, chắc chắn sẽ quay lại!', 3, 3, '2026-09-28 16:45:00')
ON DUPLICATE KEY UPDATE 
    rating = VALUES(rating),
    comment = VALUES(comment);
