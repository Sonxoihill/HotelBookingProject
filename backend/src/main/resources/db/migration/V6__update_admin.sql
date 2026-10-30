-- V6__update_admin.sql
-- Đồng bộ tài khoản Quản trị viên (ADMIN) và xóa bản ghi trùng lặp email nếu có

DELETE FROM users WHERE email = 'admin@gmail.com' AND id != 1;

INSERT INTO users (id, email, password, full_name, phone, role, status)
VALUES (1, 'admin@gmail.com', '$2a$10$OxPPTB8GlxjW2rZNo5ngl.W8tJsEgNADGJgrN1PIrgZzY6fEdJJaC', 'Quản Trị Viên', '0901234567', 'ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE 
    email = VALUES(email), 
    password = VALUES(password), 
    role = VALUES(role), 
    status = VALUES(status);
