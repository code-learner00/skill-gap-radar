// services/authService.js
'use strict';

const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function generateAccessToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

function generateRefreshToken(payload) {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

async function hashToken(token) {
  return bcrypt.hash(token, 10);
}

async function compareToken(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,   // 7 days in ms
    path:     '/api/auth/refresh',         // scope cookie to refresh endpoint only
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    path:     '/api/auth/refresh',
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  compareToken,
  setRefreshCookie,
  clearRefreshCookie,
};