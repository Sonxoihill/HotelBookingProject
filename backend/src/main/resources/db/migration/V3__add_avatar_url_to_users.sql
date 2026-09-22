-- V3__add_avatar_url_to_users.sql
-- Thêm cột avatar_url vào bảng users để hỗ trợ ảnh đại diện cho tài khoản
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL AFTER phone;
