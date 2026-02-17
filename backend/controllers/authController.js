// controllers/authController.js
'use strict';
const User    = require('../models/User');
const authSvc = require('../services/authService');
const logger  = require('../config/logger');

// ── Register ──────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { email, password, displayName } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ email, password, displayName });
    const { accessToken, refreshToken } = await issueTokens(user, res);

    res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user: user.toJSON(),
    });
  } catch (err) { next(err); }
}

// ── Login ────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      logger.warn('Failed login attempt', { email, ip: req.ip });
      if (user) {
        user.failedLogins = (user.failedLogins || 0) + 1;
        if (user.failedLogins >= 5)
          user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isLocked())
      return res.status(423).json({ message: 'Account temporarily locked. Try again in 15 minutes.' });

    user.failedLogins = 0;
    user.lockedUntil  = null;
    const { accessToken } = await issueTokens(user, res);
    await user.save();

    res.json({ message: 'Login successful', accessToken, user: user.toJSON() });
  } catch (err) { next(err); }
}

// ── Google OAuth Callback ─────────────────────────────────────────────
async function googleCallback(req, res, next) {
  try {
  if (!req.user) return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    const { accessToken } = await issueTokens(req.user, res);
    await req.user.save();
    // Redirect with access token as query param; frontend stores in memory
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${accessToken}`);
  } catch (err) { next(err); }
}

// ── Refresh Token ─────────────────────────────────────────────────────
async function refresh(req, res, next) {
  try {
    const incomingRefresh = req.cookies?.refreshToken;
    if (!incomingRefresh)
      return res.status(401).json({ message: 'No refresh token' });

    let decoded;
    try {
      decoded = authSvc.verifyRefreshToken(incomingRefresh);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshToken)
      return res.status(401).json({ message: 'Session revoked' });

    const match = await authSvc.compareToken(incomingRefresh, user.refreshToken);
    if (!match) {
      // Possible token reuse attack – revoke all sessions
      user.refreshToken = null;
      await user.save();
      logger.warn('Refresh token reuse detected', { userId: user._id });
      return res.status(401).json({ message: 'Refresh token reuse detected' });
    }

    // Rotate: issue new pair
    const { accessToken } = await issueTokens(user, res);
    await user.save();

    res.json({ accessToken });
  } catch (err) { next(err); }
}

// ── Logout ────────────────────────────────────────────────────────────
async function logout(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (user) { user.refreshToken = null; await user.save(); }
    authSvc.clearRefreshCookie(res);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
}

// ── Me ────────────────────────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshToken -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
}
// ── Helper ────────────────────────────────────────────────────────────
async function issueTokens(user, res) {
  const payload = { userId: user._id.toString(), email: user.email, role: user.role };
  const accessToken  = authSvc.generateAccessToken(payload);
  const refreshToken = authSvc.generateRefreshToken(payload);
  user.refreshToken  = await authSvc.hashToken(refreshToken);
  authSvc.setRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken };
}

module.exports = { register, login, googleCallback, refresh, logout, getMe };
