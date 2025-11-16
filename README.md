# Registration and Login System

Hệ thống đăng ký và đăng nhập với xác thực OTP qua email và đăng nhập bằng Google OAuth.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Luồng hoạt động](#luồng-hoạt-động)
- [API Endpoints](#api-endpoints)
- [Cấu trúc Database](#cấu-trúc-database)
- [Troubleshooting](#troubleshooting)

## 🎯 Tổng quan

Hệ thống cung cấp các chức năng:
- ✅ Đăng ký tài khoản với username, email, password
- ✅ Xác thực OTP qua email (6 số, hết hạn sau 5 phút)
- ✅ Đăng nhập với email/password
- ✅ Đăng nhập/đăng ký bằng Google OAuth
- ✅ Quản lý session với Redux Toolkit và Redux Persist
- ✅ Protected routes với JWT authentication
- ✅ Tự động verify token khi app load

## 🛠 Công nghệ sử dụng

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Redux Persist** - Session persistence
- **Bootstrap CSS** - Styling
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Passport.js** - Authentication middleware
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **JSON Files** - Temporary database

## 📦 Cài đặt

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

## ⚙️ Cấu hình

### 1. Backend Configuration

Tạo file `server/.env`:

```env
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SMTP_AUTH_EMAIL=your_email@gmail.com
SMTP_AUTH_PASSWORD_EMAIL=your_app_password
FRONTEND_URL=http://localhost:5173
PORT=3000
BACKEND_URL=http://localhost:3000
```

### 2. Frontend Configuration (Optional)

Tạo file `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Google OAuth Setup

Xem chi tiết trong file [server/GOOGLE_OAUTH_SETUP.md](server/GOOGLE_OAUTH_SETUP.md)

**Tóm tắt:**
1. Tạo OAuth 2.0 Client ID trong Google Cloud Console
2. Authorized redirect URI: `http://localhost:3000/api/auth/oauth/google/callback`
3. Thêm email vào Test users (nếu app ở chế độ Testing)

### 4. Gmail SMTP Setup

1. Bật 2-factor authentication trên Gmail
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Sử dụng App Password làm `SMTP_AUTH_PASSWORD_EMAIL`

## 🔄 Luồng hoạt động

### 1. Luồng Đăng ký (Registration Flow)

```
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Nhập thông tin (username, email, password, confirmPassword)
       ▼
┌─────────────────────────────────────┐
│  RegisterForm Component             │
│  - Validate input                   │
│  - Gọi API /api/register            │
└──────┬──────────────────────────────┘
       │
       │ 2. POST /api/register
       ▼
┌─────────────────────────────────────┐
│  Backend: /api/register             │
│  - Validate input                   │
│  - Check email/username exists      │
│  - Hash password (bcrypt)           │
│  - Create user (verified: false)    │
│  - Generate OTP (6 digits)          │
│  - Save OTP với expiration (5 min)  │
│  - Send OTP email                   │
└──────┬──────────────────────────────┘
       │
       │ 3. Response: { message, email }
       ▼
┌─────────────────────────────────────┐
│  Frontend: Navigate to /verify-otp  │
│  - Pass email trong state           │
└──────┬──────────────────────────────┘
       │
       │ 4. User nhập OTP
       ▼
┌─────────────────────────────────────┐
│  OTPVerification Component          │
│  - Gọi API /api/verify-otp          │
└──────┬──────────────────────────────┘
       │
       │ 5. POST /api/verify-otp
       ▼
┌─────────────────────────────────────┐
│  Backend: /api/verify-otp           │
│  - Check OTP exists                 │
│  - Check OTP not expired            │
│  - Update user (verified: true)     │
│  - Delete OTP                       │
│  - Generate JWT token               │
└──────┬──────────────────────────────┘
       │
       │ 6. Response: { token, user }
       ▼
┌─────────────────────────────────────┐
│  Frontend: Redux Dispatch           │
│  - Dispatch login({ token, user })  │
│  - Redux Persist lưu vào localStorage│
│  - Navigate to /dashboard           │
└─────────────────────────────────────┘
```

### 2. Luồng Đăng nhập (Login Flow)

```
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Nhập email và password
       ▼
┌─────────────────────────────────────┐
│  LoginForm Component                │
│  - Validate input                   │
│  - Gọi API /api/login               │
└──────┬──────────────────────────────┘
       │
       │ 2. POST /api/login
       ▼
┌─────────────────────────────────────┐
│  Backend: /api/login                │
│  - Validate input                   │
│  - Find user by email               │
│  - Check user verified              │
│  - Verify password (bcrypt.compare) │
│  - Generate JWT token               │
└──────┬──────────────────────────────┘
       │
       │ 3. Response: { token, user }
       ▼
┌─────────────────────────────────────┐
│  Frontend: Redux Dispatch           │
│  - Dispatch login({ token, user })  │
│  - Redux Persist lưu vào localStorage│
│  - Navigate to /dashboard           │
└─────────────────────────────────────┘
```

### 3. Luồng Google OAuth

```
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. Click "Đăng nhập với Google"
       ▼
┌─────────────────────────────────────┐
│  GoogleAuthButton Component         │
│  - Redirect to /api/auth/oauth/google│
└──────┬──────────────────────────────┘
       │
       │ 2. GET /api/auth/oauth/google
       ▼
┌─────────────────────────────────────┐
│  Backend: Passport Google Strategy  │
│  - Redirect to Google OAuth         │
└──────┬──────────────────────────────┘
       │
       │ 3. Google OAuth Consent Screen
       ▼
┌─────────────────────────────────────┐
│  User authorizes app                │
└──────┬──────────────────────────────┘
       │
       │ 4. Google redirects với code
       ▼
┌─────────────────────────────────────┐
│  Backend: /api/auth/oauth/google/   │
│           callback                  │
│  - Exchange code for tokens         │
│  - Get user info from Google        │
│  - Check/Create user in database    │
│  - Generate JWT token               │
└──────┬──────────────────────────────┘
       │
       │ 5. Redirect to frontend với token
       ▼
┌─────────────────────────────────────┐
│  Frontend: /auth/callback           │
│  - Verify token với backend         │
│  - Dispatch login({ token, user })  │
│  - Redux Persist lưu vào localStorage│
│  - Navigate to /dashboard           │
└─────────────────────────────────────┘
```

### 4. Luồng Session Management (Redux Persist)

```
┌─────────────────────────────────────┐
│  App Load                           │
└──────┬──────────────────────────────┘
       │
       │ 1. Redux Persist rehydrate state từ localStorage
       ▼
┌─────────────────────────────────────┐
│  AppContent Component               │
│  - Check token exists               │
│  - Dispatch verifyToken()           │
└──────┬──────────────────────────────┘
       │
       │ 2. GET /api/verify-token
       ▼
┌─────────────────────────────────────┐
│  Backend: /api/verify-token         │
│  - Verify JWT token                 │
│  - Check user exists                │
│  - Return user data                 │
└──────┬──────────────────────────────┘
       │
       │ 3. Response: { valid, user }
       ▼
┌─────────────────────────────────────┐
│  Redux: verifyToken.fulfilled       │
│  - Update user state                │
│  - Set isAuthenticated: true        │
│  - Set loading: false               │
└─────────────────────────────────────┘
```

### 5. Luồng Protected Routes

```
┌─────────────────────────────────────┐
│  User truy cập /dashboard           │
└──────┬──────────────────────────────┘
       │
       │ 1. ProtectedRoute Component
       ▼
┌─────────────────────────────────────┐
│  ProtectedRoute                     │
│  - useSelector(state => state.auth) │
│  - Check loading state              │
│  - Check isAuthenticated            │
└──────┬──────────────────────────────┘
       │
       ├─ Loading: true
       │  └─> Show loading spinner
       │
       ├─ isAuthenticated: false
       │  └─> Redirect to /login
       │
       └─ isAuthenticated: true
          └─> Render Dashboard
```

### 6. Luồng API Request với Token

```
┌─────────────────────────────────────┐
│  Frontend: API Request              │
└──────┬──────────────────────────────┘
       │
       │ 1. Axios interceptor
       ▼
┌─────────────────────────────────────┐
│  Request Interceptor                │
│  - Get token from Redux store       │
│  - Add Authorization header         │
└──────┬──────────────────────────────┘
       │
       │ 2. Send request với token
       ▼
┌─────────────────────────────────────┐
│  Backend: API Endpoint              │
│  - Verify JWT token (middleware)    │
│  - Process request                  │
└──────┬──────────────────────────────┘
       │
       │ 3. Response
       ▼
┌─────────────────────────────────────┐
│  Response Interceptor               │
│  - Check status 401                 │
│  - Dispatch logout()                │
│  - Redirect to /login               │
└─────────────────────────────────────┘
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | Đăng ký tài khoản mới | No |
| POST | `/api/verify-otp` | Xác thực OTP | No |
| POST | `/api/resend-otp` | Gửi lại OTP | No |
| POST | `/api/login` | Đăng nhập | No |
| GET | `/api/verify-token` | Verify JWT token | Yes |

### OAuth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/oauth/google` | Initiate Google OAuth | No |
| GET | `/api/auth/oauth/google/callback` | Google OAuth callback | No |

## 💾 Cấu trúc Database

### users.json

```json
[
  {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "password": "hashed_password",
    "googleId": "string (optional)",
    "verified": "boolean",
    "picture": "string (optional)",
    "name": "string (optional)",
    "createdAt": "ISO date string"
  }
]
```

### otps.json

```json
[
  {
    "email": "string",
    "code": "6-digit string",
    "expiresAt": "ISO date string",
    "userId": "uuid"
  }
]
```

### sessions.json

```json
[]
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt với 10 salt rounds
- **JWT Tokens**: Expiration 24 hours
- **OTP Expiration**: 5 minutes
- **Input Validation**: Email format, password strength, username format
- **CORS**: Chỉ cho phép requests từ FRONTEND_URL
- **Environment Variables**: Sensitive data trong .env

## 🚀 Chạy ứng dụng

### Development

**Backend:**
```bash
cd server
npm start
# hoặc
npm run dev  # với auto-reload
```

**Frontend:**
```bash
cd client
npm run dev
```

### Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 🐛 Troubleshooting

### Lỗi OAuth "Error 400: invalid_request"

1. Kiểm tra redirect URI trong Google Console khớp chính xác
2. Đảm bảo email đã được thêm vào Test users
3. Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env

### Lỗi Email không gửi được

1. Kiểm tra SMTP_AUTH_EMAIL và SMTP_AUTH_PASSWORD_EMAIL
2. Đảm bảo đã bật 2FA và tạo App Password
3. Kiểm tra email có trong spam folder

### Token không persist sau khi refresh

1. Kiểm tra Redux Persist configuration
2. Kiểm tra localStorage có bị clear không
3. Kiểm tra token có được lưu trong Redux state

### Protected route redirect về login

1. Kiểm tra token có hợp lệ không
2. Kiểm tra token có expired không
3. Kiểm tra verifyToken action có được dispatch không

## 📝 Notes

- Database hiện tại sử dụng JSON files (temporary)
- Để production, nên migrate sang MongoDB hoặc PostgreSQL
- Google OAuth cần verify app với Google để publish (cho tất cả users)
- OTP codes tự động bị xóa sau khi hết hạn
- Session được persist trong localStorage thông qua Redux Persist

## 📄 License

MIT
