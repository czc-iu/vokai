-- 将第一个用户设置为管理员
UPDATE users SET role = 'admin' WHERE id = 1;

-- 或者通过邮箱设置管理员
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- 查看所有管理员
SELECT id, email, name, role FROM users WHERE role = 'admin';
