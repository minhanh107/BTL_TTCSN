# Seed Scripts

## Tạo tài khoản Admin

Script này tạo tài khoản admin mặc định cho hệ thống.

### Cách sử dụng:

1. **Chạy với thông tin mặc định:**
   ```bash
   npm run seed:admin
   ```
   
   Thông tin mặc định:
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `admin123`
   - Full Name: `Administrator`

2. **Chạy với thông tin tùy chỉnh (qua environment variables):**
   
   Tạo hoặc cập nhật file `.env` trong thư mục `server`:
   ```env
   ADMIN_USERNAME=myadmin
   ADMIN_EMAIL=admin@mysite.com
   ADMIN_PASSWORD=MySecurePassword123
   ADMIN_FULLNAME=My Admin Name
   ```
   
   Sau đó chạy:
   ```bash
   npm run seed:admin
   ```

3. **Cập nhật mật khẩu cho admin đã tồn tại:**
   ```bash
   npm run seed:admin -- --update-password
   ```

### Lưu ý:

- Script sẽ kiểm tra xem admin đã tồn tại chưa (theo email, username hoặc role)
- Nếu admin đã tồn tại, script sẽ không tạo mới (trừ khi dùng flag `--update-password`)
- Admin được tạo với `verified: true` (không cần verify qua email)
- **Quan trọng**: Hãy đổi mật khẩu mặc định sau khi đăng nhập!

