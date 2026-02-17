// app.js – Express application factory
'use strict';

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const passport     = require('passport');
const cookieParser = require('cookie-parser');

// Load passport strategy registration (side-effect import)
require('./config/passport');

const authRoutes     = require('./routes/authRoutes');
const resumeRoutes   = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const errorHandler   = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const logger         = require('./config/logger');

const app = express();

// ── 1. Security headers (Helmet) ─────────────────────────────────────────────
app.use(helmet());

// ── 2. CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',  // Vite default dev port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials:  true,                           // required for cookies
  methods:      ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── 3. Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// ── 4. Passport (OAuth only, no sessions) ────────────────────────────────────
app.use(passport.initialize());

// ── 5. Global rate limiter ────────────────────────────────────────────────────
app.use(globalLimiter);

// ── 6. Request logging ────────────────────────────────────────────────────────
app.use(function (req, _res, next) {
  logger.info(req.method + ' ' + req.originalUrl, { ip: req.ip });
  next();
});

// ── 7. Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/resume',   resumeRoutes);
app.use('/api/analysis', analysisRoutes);

// ── 8. Health check ───────────────────────────────────────────────────────────
app.get('/health', function (_req, res) {
  res.json({ status: 'ok', timestamp: Date.now(), env: process.env.NODE_ENV });
});

// ── 9. 404 handler ────────────────────────────────────────────────────────────
app.use(function (_req, res) {
  res.status(404).json({ message: 'Route not found' });
});

// ── 10. Centralized error handler (must be last, 4 params) ───────────────────
app.use(errorHandler);

module.exports = app;