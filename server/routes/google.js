const express = require('express');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL, BACKEND_URL } = require('../config');

const router = express.Router();

// Validate Google OAuth configuration
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('WARNING: Google OAuth credentials not set in environment variables');
  console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
}

// Configure Google OAuth Strategy
// Note: Callback URL must match EXACTLY with Google Cloud Console configuration
const callbackURL = `${BACKEND_URL}/api/auth/oauth/google/callback`;
console.log('Google OAuth Configuration:');
console.log('  Client ID:', GOOGLE_CLIENT_ID ? 'Set' : 'NOT SET');
console.log('  Client Secret:', GOOGLE_CLIENT_SECRET ? 'Set' : 'NOT SET');
console.log('  Callback URL:', callbackURL);
console.log('  Frontend URL:', FRONTEND_URL);
console.log('  ⚠️  IMPORTANT: Callback URL must match Google Cloud Console exactly!');

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { id: googleId, emails, displayName, photos } = profile;
    const email = emails && emails[0] ? emails[0].value : null;
    const picture = photos && photos[0] ? photos[0].value : null;

    if (!email) {
      return done(new Error('No email found in Google profile'), null);
    }

    // Check if user exists by Google ID
    let user = await userService.findUserByGoogleId(googleId);

    if (!user) {
      // Check if user exists by email
      user = await userService.findUserByEmail(email);

      if (user) {
        // Update existing user with Google ID
        user = await userService.updateUser(email, {
          googleId,
          verified: true,
          picture,
          name: displayName
        });
      } else {
        // Create new user
        const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
        user = await userService.createUser({
          username,
          email,
          googleId,
          verified: true,
          picture,
          name: displayName
        });
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Initiate Google OAuth flow
router.get('/auth/oauth/google', (req, res, next) => {
  console.log('Initiating Google OAuth...');
  console.log('Callback URL:', callbackURL);
  console.log('Client ID:', GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

// Handle Google OAuth callback
router.get('/auth/oauth/google/callback',
  (req, res, next) => {
    console.log('Google OAuth callback received');
    console.log('Query params:', req.query);
    console.log('Error from Google:', req.query.error);
    
    if (req.query.error) {
      console.error('OAuth Error:', req.query.error);
      console.error('Error description:', req.query.error_description);
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed&details=${encodeURIComponent(req.query.error_description || req.query.error)}`);
    }
    
    passport.authenticate('google', { 
      session: false, 
      failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` 
    })(req, res, next);
  },
  async (req, res) => {
    try {
      if (!req.user) {
        console.error('No user in request after authentication');
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
      }
      
      const user = req.user;
      console.log('User authenticated:', user.email);
      
      // Generate token
      const token = generateToken(user);

      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&email=${encodeURIComponent(user.email)}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
