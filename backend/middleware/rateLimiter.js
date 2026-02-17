// middleware/rateLimiter.js
'use strict';

const rateLimit = require('express-rate-limit');

// ── Global limiter (applied to all routes in app.js) ─────────────────────
const globalLimiter = rateLimit({
  windowMs:        parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:             parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true,   // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders:   false,  // Disable the `X-RateLimit-*` headers
  message:         { message: 'Too many requests, please try again later.' },
});

// ── Auth limiter (login + register) ──────────────────────────────────────
const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,  // 15 minutes
  max:                    20,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,             // only count failures toward limit
  message:                { message: 'Too many authentication attempts. Try again in 15 minutes.' },
});

// ── Analysis limiter (expensive operation) ────────────────────────────────
const analyzeLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             parseInt(process.env.ANALYZE_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { message: 'Analysis rate limit reached. Please wait 15 minutes.' },
});

module.exports = {
  globalLimiter,
  authLimiter,
  analyzeLimiter,
};