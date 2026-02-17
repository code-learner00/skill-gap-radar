// middleware/errorHandler.js – Centralized error handler
'use strict';

const logger = require('../config/logger');

// IMPORTANT: Express identifies error handlers by their 4-parameter signature.
// Do NOT remove the `_next` parameter even if unused.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(req.method + ' ' + req.originalUrl + ' – ' + status + ': ' + message, {
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    ip:    req.ip,
  });

  // ── Mongoose validation error ──────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(function (e) { return e.message; });
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // ── Mongoose duplicate key ─────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: field + ' already exists' });
  }

  // ── Mongoose cast error (invalid ObjectId) ─────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // ── Multer file errors ─────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }

  // ── Generic ────────────────────────────────────────────────────────────
  return res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;