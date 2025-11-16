# Registration and Login System - Frontend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the client directory (optional):
```
VITE_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The application will run on http://localhost:5173

## Features

- User registration with username, email, password, and confirm password
- OTP verification via email (6-digit code, expires in 5 minutes)
- User login with email and password
- Google OAuth login/registration
- Protected routes with JWT authentication
- Responsive design with Bootstrap CSS

## Pages

- `/login` - Login page
- `/register` - Registration page
- `/verify-otp` - OTP verification page
- `/dashboard` - Protected dashboard page
- `/auth/callback` - OAuth callback handler
