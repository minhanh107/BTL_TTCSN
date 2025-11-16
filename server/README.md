# Registration and Login System - Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory with the following variables:
```
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SMTP_AUTH_EMAIL=your_email@gmail.com
SMTP_AUTH_PASSWORD_EMAIL=your_app_password
FRONTEND_URL=http://localhost:5173
PORT=3000
BACKEND_URL=http://localhost:3000
```

3. For Gmail SMTP:
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the App Password as `SMTP_AUTH_PASSWORD_EMAIL`

4. For Google OAuth:
   - Go to Google Cloud Console: https://console.cloud.google.com/
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
   - Copy Client ID and Client Secret to `.env`

5. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on http://localhost:3000

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/verify-otp` - Verify OTP code
- `POST /api/resend-otp` - Resend OTP code
- `POST /api/login` - Login user
- `GET /api/verify-token` - Verify JWT token
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

## Database

Data is stored in JSON files in the `data/` directory:
- `users.json` - User accounts
- `otps.json` - OTP codes
- `sessions.json` - Active sessions (optional)

