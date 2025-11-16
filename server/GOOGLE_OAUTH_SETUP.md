# Hướng dẫn cấu hình Google OAuth

## Lỗi thường gặp: Error 400: invalid_request

Lỗi này xảy ra khi Google OAuth không được cấu hình đúng. Dưới đây là các bước để fix:

## Bước 1: Tạo OAuth 2.0 Credentials trong Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Nếu chưa có, bạn sẽ cần cấu hình OAuth consent screen trước

## Bước 2: Cấu hình OAuth Consent Screen

1. Vào **APIs & Services** > **OAuth consent screen**
2. Chọn **External** (cho development) hoặc **Internal** (chỉ cho G Suite)
3. Điền thông tin:
   - **App name**: Tên ứng dụng của bạn
   - **User support email**: Email hỗ trợ
   - **Developer contact information**: Email của developer
4. Thêm **Scopes**:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Thêm **Test users** (QUAN TRỌNG cho chế độ testing):
   - Thêm email của bạn vào danh sách test users
   - Ví dụ: `fctrainhoi@gmail.com`
6. Lưu và tiếp tục

## Bước 3: Tạo OAuth 2.0 Client ID

1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Application type**: **Web application**
4. Đặt tên cho client ID
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://test-hoangg04.com:3000
   http://localhost:5173
   ```
6. **Authorized redirect URIs** (QUAN TRỌNG - phải khớp chính xác với route trong code):
   ```
   http://localhost:3000/api/auth/oauth/google/callback
   http://test-hoangg04.com:3000/api/auth/oauth/google/callback
   ```
   ⚠️ **LƯU Ý**: Path `/api/auth/oauth/google/callback` phải khớp CHÍNH XÁC với route trong `server/routes/google.js`
7. Click **Create**
8. Copy **Client ID** và **Client Secret**

## Bước 4: Cấu hình .env file

Thêm vào file `server/.env`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

## Bước 5: Kiểm tra callback URL

Đảm bảo callback URL trong code khớp chính xác với Google Cloud Console:
- Trong code: `http://localhost:3000/api/auth/google/callback`
- Trong Google Console: Phải có chính xác URL này trong **Authorized redirect URIs**

## Bước 6: Test users (QUAN TRỌNG)

Nếu app đang ở chế độ **Testing**:
1. Vào **OAuth consent screen**
2. Thêm email của bạn vào **Test users**
3. Chỉ những email trong test users mới có thể đăng nhập
4. Để publish app (cho tất cả users), bạn cần verify app với Google (cần ít nhất 100 users)

## Bước 7: Kiểm tra lại

1. Đảm bảo server đang chạy trên port 3000
2. Đảm bảo BACKEND_URL trong .env là `http://localhost:3000`
3. Đảm bảo redirect URI trong Google Console khớp chính xác
4. Đảm bảo bạn đã thêm email vào test users (nếu app ở chế độ testing)

## Troubleshooting

### Lỗi: "Access blocked: Authorization Error"
- **Nguyên nhân**: App chưa được verify hoặc user chưa được thêm vào test users
- **Giải pháp**: Thêm email vào test users trong OAuth consent screen

### Lỗi: "Error 400: invalid_request"
- **Nguyên nhân**: Redirect URI không khớp
- **Giải pháp**: Kiểm tra lại redirect URI trong Google Console và trong code

### Lỗi: "redirect_uri_mismatch"
- **Nguyên nhân**: Redirect URI trong request không khớp với cấu hình
- **Giải pháp**: Đảm bảo redirect URI chính xác, bao gồm cả http/https và port

## Lưu ý

- **Development**: Sử dụng `http://localhost` với port cụ thể
- **Production**: Cần sử dụng HTTPS và domain thực
- **Testing mode**: Chỉ test users mới có thể đăng nhập
- **Publishing**: Cần verify app với Google để publish (mất vài ngày đến vài tuần)

