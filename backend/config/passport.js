// config/passport.js – Google OAuth 2.0 strategy
'use strict';
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User     = require('../models/User');
const logger   = require('./logger');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  scope:        ['profile', 'email'],
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email   = profile.emails?.[0]?.value;
    const googleId = profile.id;

    if (!email) return done(new Error('Google account has no email'), null);

    // Upsert: find by googleId OR email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        email,
        googleId,
        displayName: profile.displayName,
        role: 'user',
      });
      logger.info('New Google user created', { email });
    } else if (!user.googleId) {
      // Existing email user – link Google account
      user.googleId    = googleId;
      user.displayName = user.displayName || profile.displayName;
      await user.save();
      logger.info('Linked Google to existing user', { email });
    }

    return done(null, user);
  } catch (err) {
    logger.error('Google OAuth error', { err });
    return done(err, null);
  }
}));

