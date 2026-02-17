// routes/authRoutes.js
'use strict';

const express   = require('express');
const router    = express.Router();
const passport  = require('passport');
const ctrl      = require('../controllers/authController');
const auth      = require('../middleware/authenticate');
const validate  = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// ── Email / Password ─────────────────────────────────────────────────────────
router.post('/register', authLimiter, validate('register'), ctrl.register);
router.post('/login',    authLimiter, validate('login'),    ctrl.login);

// ── Token Management ─────────────────────────────────────────────────────────
// Refresh: reads HTTP-only cookie – no auth middleware (token may be expired)
router.post('/refresh', ctrl.refresh);

// Logout: requires valid access token to identify the user session to revoke
router.post('/logout', auth, ctrl.logout);

// Me: fetch current user profile
router.get('/me', auth, ctrl.getMe);

// ── Google OAuth ─────────────────────────────────────────────────────────────
// Step 1: redirect to Google
router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope:   ['profile', 'email'],
  })
);

// Step 2: Google redirects back with code → exchange for profile → issue JWT
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session:         false,
    failureRedirect: (process.env.CLIENT_URL || 'http://localhost:3000') + '/login?error=oauth_failed',
  }),
  ctrl.googleCallback
);

module.exports = router;